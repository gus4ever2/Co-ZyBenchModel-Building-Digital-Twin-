"""Business and data-access logic for the FastAPI analytics controller.

``analytics_service`` is created once when the application imports this module.
It is safe to share because every request creates fresh runner/data objects;
the service stores no simulation-specific mutable state.
"""

from datetime import datetime
from decimal import Decimal
from typing import Any

from bson import ObjectId

from cosimulator.analytics.data import enrich
from cosimulator.analytics.registry import available, comparison_ids, select
from cosimulator.analytics.runner import create_comparison_states, run
from cosimulator.database.mongo_config.mongo_config import MongoConfig


class AnalyticsServiceError(ValueError):
    """A service-level validation error that the controller maps to HTTP."""


class SimulationNotFoundError(AnalyticsServiceError):
    """The simulation id is valid but is not owned by the requesting user."""


class AnalyticsService:
    """Coordinate ownership checks, MongoDB reads and analytics calculations."""

    # Public API operations -------------------------------------------------
    # These methods are the only entry points used by FastAPI routes.

    def available_analytics(self) -> list[dict[str, str]]:
        """Return the standard analytic names exposed by the API."""
        return available()

    def analyse(
        self,
        simulation_id: str,
        user_email: str,
        analysis_start: datetime | None = None,
        analysis_end: datetime | None = None,
        start_index: int = 0,
        end_index: int | None = None,
        selected: list[str] | None = None,
    ):
        """Run default or selected analytics for one owned simulation."""
        self._validate_range(analysis_start, analysis_end)
        try:
            select(selected)  # Reject unknown names before opening a MongoDB cursor.
        except ValueError as error:
            raise AnalyticsServiceError(str(error)) from error

        with self._timesteps(
            simulation_id,
            user_email,
            analysis_start,
            analysis_end,
        ) as rows:
            self._apply_index_range(rows, start_index, end_index)
            if self._is_empty_range(start_index, end_index):
                return run(simulation_id, [], selected)
            return run(simulation_id, rows, selected)

    def compare(
        self,
        user_email: str,
        simulation_ids: list[str],
        analysis_start: datetime | None,
        analysis_end: datetime | None,
        references: list[dict[str, Any]],
    ) -> dict[str, Any]:
        """Return charts and aggregate deltas for a baseline and its scenarios."""
        self._validate_range(analysis_start, analysis_end)

        baseline_id = simulation_ids[0]
        analytics_by_simulation, result = self._run_comparison_analytics(
            user_email,
            simulation_ids,
            analysis_start,
            analysis_end,
        )

        self._attach_reference_names(result, baseline_id, references)
        self._attach_metric_deltas(analytics_by_simulation, baseline_id)
        self._attach_seasonal_deltas(analytics_by_simulation, baseline_id)

        result["analyticsBySimulation"] = analytics_by_simulation
        result["plantConfigurations"] = [
            self._plant_configuration(reference)
            for reference in references
        ]
        return result

    def latest_timestep(
        self,
        simulation_id: str,
        user_email: str,
    ) -> dict[str, Any] | None:
        """Read and enrich the newest saved timestep for one simulation."""
        self._assert_owned(simulation_id, user_email)

        row = MongoConfig("simulation_timesteps").collection.find_one(
            {"simulation_id": simulation_id, "user_email": user_email},
            sort=[("timestep_number", -1)],
        )
        return enrich(row) if row is not None else None

    def _run_comparison_analytics(
        self,
        user_email: str,
        simulation_ids: list[str],
        analysis_start: datetime | None,
        analysis_end: datetime | None,
    ) -> tuple[dict[str, dict[str, Any]], dict[str, Any]]:
        # Comparison loading ------------------------------------------------
        # Keep calculation state alive across simulations so metrics can use
        # the first simulation as their baseline.
        """Run all analytics while their registered state controls persistence."""
        analytics_by_simulation: dict[str, dict[str, Any]] = {}
        persistent_states = create_comparison_states()
        latest_response = None

        for simulation_id in simulation_ids:
            with self._timesteps(
                simulation_id,
                user_email,
                analysis_start,
                analysis_end,
            ) as rows:
                response = run(
                    simulation_id,
                    rows,
                    persistent_states=persistent_states,
                )
                analytics_by_simulation[simulation_id] = response.model_dump()
                latest_response = response

        return analytics_by_simulation, self._comparison_result(latest_response)

    @staticmethod
    def _comparison_result(response: Any) -> dict[str, Any]:
        """Return the first registered comparison result without knowing its logic."""
        if response is None:
            return {"comparisons": [], "analysisRange": {"start": None, "end": None}}

        for analytic_id in comparison_ids():
            comparison = response.results.get(analytic_id, {}).get("comparison")
            if comparison is not None:
                return comparison

        return {"comparisons": [], "analysisRange": {"start": None, "end": None}}

    def _timesteps(
        self,
        simulation_id: str,
        user_email: str,
        analysis_start: datetime | None,
        analysis_end: datetime | None,
    ):
        """Open a sorted cursor only after ownership has been verified."""
        self._assert_owned(simulation_id, user_email)

        query: dict[str, Any] = {
            "simulation_id": simulation_id,
            "user_email": user_email,
        }
        if analysis_start or analysis_end:
            query["simulation_timestamp"] = {
                **({"$gte": analysis_start} if analysis_start else {}),
                **({"$lte": analysis_end} if analysis_end else {}),
            }

        return (
            MongoConfig("simulation_timesteps")
            .collection.find(query)
            .sort([("timestep_number", 1), ("_id", 1)])
            .batch_size(1000)
        )

    @staticmethod
    def _apply_index_range(rows: Any, start_index: int, end_index: int | None) -> None:
        """Apply pagination directly to the MongoDB cursor before reading it."""
        rows.skip(start_index)
        if end_index is not None and end_index > start_index:
            rows.limit(end_index - start_index)

    @staticmethod
    def _is_empty_range(start_index: int, end_index: int | None) -> bool:
        """Detect an empty requested index range without querying MongoDB."""
        return end_index is not None and end_index <= start_index

    @staticmethod
    def _validate_range(
        analysis_start: datetime | None,
        analysis_end: datetime | None,
    ) -> None:
        if analysis_start and analysis_end and analysis_start > analysis_end:
            raise AnalyticsServiceError("Invalid analysis range")

    @staticmethod
    def _attach_reference_names(
        result: dict[str, Any],
        baseline_id: str,
        references: list[dict[str, Any]],
    ) -> None:
        """Replace simulation ids in comparison output with provided display data."""
        references_by_id = {
            reference["id"]: reference
            for reference in references
        }

        result["baseline"] = references_by_id.get(
            baseline_id,
            {"id": baseline_id, "name": baseline_id},
        )
        for comparison in result["comparisons"]:
            simulation_id = comparison["simulation"]["id"]
            comparison["simulation"] = references_by_id.get(
                simulation_id,
                {"id": simulation_id, "name": simulation_id},
            )

    @staticmethod
    def _attach_metric_deltas(
        analytics_by_simulation: dict[str, dict[str, Any]],
        baseline_id: str,
    ) -> None:
        """Add baseline-relative aggregate metrics without rereading timesteps."""
        baseline_metrics = analytics_by_simulation[baseline_id]["metrics"]
        comparable_names = (
            "totalHeatingKwh",
            "totalCoolingKwh",
            "totalHvacKwh",
            "meanOutdoorAirFraction",
        )

        for response in analytics_by_simulation.values():
            metrics = response["metrics"]
            for name in comparable_names:
                delta, percent = AnalyticsService._metric_delta(
                    metrics.get(name),
                    baseline_metrics.get(name),
                )
                metrics[f"{name}Delta"] = delta
                metrics[f"{name}DeltaPercent"] = percent

    @staticmethod
    def _attach_seasonal_deltas(analytics_by_simulation, baseline_id) -> None:
        """Align seasonal graph differences by timestamp and calculate table deltas."""
        baseline_periods = analytics_by_simulation[baseline_id]["results"].get(
            "seasonal_energy", {}).get("periods", {})
        for key, baseline_period in baseline_periods.items():
            baseline_values = {
                point["timestamp"]: point.get("hvacKwh")
                for point in baseline_period["series"]
            }
            for response in analytics_by_simulation.values():
                period = response["results"].get("seasonal_energy", {}).get("periods", {}).get(key)
                if period is None:
                    continue
                for name in ("totalHeatingKwh", "totalCoolingKwh", "totalHvacKwh"):
                    delta, percent = AnalyticsService._metric_delta(
                        period["metrics"].get(name), baseline_period["metrics"].get(name))
                    period["metrics"][name + "Delta"] = delta
                    period["metrics"][name + "DeltaPercent"] = percent
                for point in period["series"]:
                    value, baseline = point.get("hvacKwh"), baseline_values.get(point["timestamp"])
                    point["hvacDeltaKwh"] = value - baseline if value is not None and baseline is not None else None

    @staticmethod
    def _metric_delta(
        scenario_value: float | int | None,
        baseline_value: float | int | None,
    ) -> tuple[float | None, float | None]:
        """Return scenario-minus-baseline difference and safe percentage change."""
        if scenario_value is None or baseline_value is None:
            return None, None

        delta = scenario_value - baseline_value
        percent = delta / baseline_value * 100 if baseline_value else None
        return delta, percent

    @staticmethod
    def _plant_configuration(reference: dict[str, Any]) -> dict[str, Any]:
        """Attach saved plant-grid metadata to one comparison reference."""
        plant = reference.get("plantSimulation")
        result = AnalyticsService._empty_plant_configuration(reference, bool(plant))
        if not plant:
            return result

        plant_id = plant.get("plantId")
        grid = AnalyticsService._find_plant_grid(plant_id)
        ppfd = AnalyticsService._ppfd_for_level(plant.get("lightingLevel"))
        grid_key = AnalyticsService._grid_key(ppfd)

        result.update(
            {
                "plantId": plant_id,
                "plantName": plant.get("plantName"),
                "greenWallSize": plant.get("greenWallSize"),
                "lightingLevel": plant.get("lightingLevel"),
                "ppfdUmolM2S": ppfd,
                "plantFileIdentifier": grid.get("plant_file"),
                "leafFileIdentifier": grid.get("leaf_file"),
                "totalLeafAreaM2": grid.get("total_leaf_area_m2"),
                "meanParLeafUmolM2S": (
                    grid.get("mean_par_leaf_umol_m2_s_by_ppfd") or {}
                ).get(grid_key),
            }
        )
        if result["totalLeafAreaM2"] is None or result["meanParLeafUmolM2S"] is None:
            result["missingDataReason"] = (
                "Total leaf area or mean PARleaf is not stored for this plant profile"
            )
        else:
            result["missingDataReason"] = None
        return result

    @staticmethod
    def _empty_plant_configuration(
        reference: dict[str, Any],
        enabled: bool,
    ) -> dict[str, Any]:
        """Create a stable response shape before optional plant metadata is known."""
        return {
            "simulationId": reference["id"],
            "simulationName": reference["name"],
            "enabled": enabled,
            "plantId": None,
            "plantName": None,
            "greenWallSize": None,
            "lightingLevel": None,
            "ppfdUmolM2S": None,
            "plantFileIdentifier": None,
            "leafFileIdentifier": None,
            "totalLeafAreaM2": None,
            "meanParLeafUmolM2S": None,
            "missingDataReason": "Plant simulation is disabled",
        }

    @staticmethod
    def _find_plant_grid(plant_id: str | None) -> dict[str, Any]:
        """Prefer the latest grid document, then fall back to library profile data."""
        if not plant_id:
            return {}

        grid = MongoConfig("plant_profile_grids").collection.find_one(
            {"plant_id": plant_id},
            sort=[("recorded_at", -1)],
        )
        if grid is not None:
            return grid
        if not ObjectId.is_valid(plant_id):
            return {}

        plant = MongoConfig("plantLibrary").collection.find_one(
            {"_id": ObjectId(plant_id)}
        )
        return (plant or {}).get("profile") or {}

    @staticmethod
    def _ppfd_for_level(lighting_level: str | None) -> int | None:
        return {
            "LOW": 50,
            "MEDIUM": 100,
            "HIGH": 200,
            "VERY_HIGH": 300,
        }.get(lighting_level)

    @staticmethod
    def _grid_key(ppfd: int | None) -> str:
        """Match the normalized PPFD key used in stored grid profile documents."""
        if ppfd is None:
            return ""
        return format(Decimal(str(ppfd)).normalize(), "f").replace("-", "m").replace(".", "p")

    @staticmethod
    def _assert_owned(simulation_id: str, user_email: str) -> None:
        """Validate id syntax and verify the simulation belongs to the requester."""
        if not ObjectId.is_valid(simulation_id):
            raise AnalyticsServiceError("Invalid simulation id")

        simulation = MongoConfig("simulations").collection.find_one(
            {"_id": ObjectId(simulation_id), "user_email": user_email}
        )
        if simulation is None:
            raise SimulationNotFoundError("Simulation not found")


# The application imports this module once, so this is the single service instance.
analytics_service = AnalyticsService()
