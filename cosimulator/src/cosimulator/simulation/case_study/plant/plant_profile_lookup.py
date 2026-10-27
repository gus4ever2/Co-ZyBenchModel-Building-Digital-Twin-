from functools import lru_cache
from itertools import product
from dataclasses import dataclass
from typing import Any

from cosimulator.services.plant_profile_grid_service import (
    PlantProfileGridService,
    plant_profile_grid_service,
)


@dataclass(frozen=True, slots=True)
class PlantPhysiologyResponse:
    """Interpolated reference-panel response from the plant grid."""

    net_co2_exchange_g_per_hour: float
    transpiration_kg_per_hour: float
    latent_heat_flux_w_m2_leaf: float
    sensible_heat_flux_w_m2_leaf: float
    incident_shortwave_flux_w_m2_leaf: float
    net_radiation_flux_w_m2_leaf: float
    longwave_emission_flux_w_m2_leaf: float
    leaf_temperature_c: float | None
    stomatal_conductance_mol_m2_s: float | None
    reference_panel_area_m2: float
    total_leaf_area_m2: float
    has_transpiration_data: bool
    has_thermal_flux_data: bool
    energy_balance_failed_leaf_fraction: float | None

def _bounding_values(value: float, grid: tuple[float, ...]) -> tuple[float, float, float]:
    """Return lower value, upper value and interpolation weight.

    Runtime values outside the generated grid are clamped because the plant
    model was not evaluated outside these physical input combinations.
    """
    if value <= grid[0]:
        return grid[0], grid[0], 0.0
    if value >= grid[-1]:
        return grid[-1], grid[-1], 0.0
    # Find the two stored values surrounding the live simulation value.
    for lower, upper in zip(grid, grid[1:]):
        if lower <= value <= upper:
            return lower, upper, (value - lower) / (upper - lower)
    raise RuntimeError("The interpolation grid is not ordered correctly")


class PlantProfileLookup:
    """Interpolate the time-independent four-dimensional indoor plant grid."""

    def __init__(
        self,
        *,
        plant_id: str | None,
        city: str | None = None,
        plant_name: str | None = None,
        profile_service: PlantProfileGridService = plant_profile_grid_service,
    ) -> None:
        # city and plant_name remain accepted for compatibility with the
        # simulation orchestrator; profile identity is now exclusively plant_id.
        del city, plant_name
        if plant_id is None or not plant_id.strip():
            raise ValueError("plant_id is required for plant-profile lookup")
        self._plant_id = plant_id.strip()  # MongoDB identity of the grid.
        self._profile_service = profile_service  # Allows test replacement.

    @lru_cache(maxsize=1)
    def _load_grid(self) -> dict[str, Any]:
        # The same static grid is used throughout the annual simulation.
        document = self._profile_service.get(plant_id=self._plant_id)
        if document is None:
            raise ValueError(
                "Plant response grid is missing from MongoDB for "
                f"plant_id='{self._plant_id}'"
            )
        if document.get("schema_version") != 5:
            raise ValueError(
                f"Plant '{self._plant_id}' does not contain a supported response grid"
            )
        return document

    @staticmethod
    def _profile_key(value: float) -> str:
        return format(float(value), ".10g").replace("-", "m").replace(".", "p")

    def _value_at_grid_point(
        self,
        *,
        profiles: dict[str, Any],
        ppfd_umol_m2_s: float,
        air_temperature_c: float,
        relative_humidity_percent: float,
        co2_concentration_ppm: float,
    ) -> float | dict[str, Any]:
        return (
            profiles[self._profile_key(ppfd_umol_m2_s)]
            [self._profile_key(air_temperature_c)]
            [self._profile_key(relative_humidity_percent)]
            [self._profile_key(co2_concentration_ppm)]
        )

    def get_response(
        self,
        *,
        air_temperature_c: float,
        relative_humidity_percent: float,
        co2_concentration_ppm: float,
        ppfd_umol_m2_s: float,
    ) -> PlantPhysiologyResponse:
        """Return the interpolated reference-panel physiological response."""
        document = self._load_grid()  # Cached MongoDB grid document.
        panel_area_m2 = float(document.get("panel_area_m2", 1.0))
        if panel_area_m2 <= 0:
            raise ValueError("Plant response grid has an invalid reference panel area")
        total_leaf_area_m2 = float(document.get("total_leaf_area_m2", 1.0))
        if total_leaf_area_m2 <= 0:
            raise ValueError("Plant response grid has an invalid total leaf area")
        axes = document["axes"]
        # CARIBU/plantecophys generated a four-dimensional response grid.
        requested_values = (
            ppfd_umol_m2_s,
            air_temperature_c,
            relative_humidity_percent,
            co2_concentration_ppm,
        )
        axis_names = (
            "ppfd_umol_m2_s",
            "temperature_c",
            "relative_humidity_percent",
            "co2_ppm",
        )
        dimensions = tuple(
            _bounding_values(
                float(value),
                tuple(float(point) for point in axes[axis_name]),
            )
            for value, axis_name in zip(requested_values, axis_names)
        )

        # Multilinear interpolation combines the 2⁴ neighbouring grid points.
        weighted_values: dict[str, float] = {}
        for upper_choices in product((False, True), repeat=len(dimensions)):
            point: list[float] = []  # One coordinate in the stored grid.
            weight = 1.0  # Contribution of this corner to the final response.
            for (lower, upper, fraction), use_upper in zip(
                dimensions, upper_choices
            ):
                point.append(upper if use_upper else lower)
                weight *= fraction if use_upper else 1.0 - fraction
            if weight == 0.0:
                continue
            value = self._value_at_grid_point(
                profiles=document["profiles"],
                ppfd_umol_m2_s=point[0],
                air_temperature_c=point[1],
                relative_humidity_percent=point[2],
                co2_concentration_ppm=point[3],
            )
            if isinstance(value, dict):
                for field, raw_value in value.items():
                    weighted_values[field] = weighted_values.get(field, 0.0) + (
                        weight * float(raw_value)
                    )
            else:
                weighted_values["net_co2_exchange_g_per_hour"] = (
                    weighted_values.get("net_co2_exchange_g_per_hour", 0.0)
                    + weight * float(value)
                )

        return PlantPhysiologyResponse(
            net_co2_exchange_g_per_hour=weighted_values.get(
                "net_co2_exchange_g_per_hour", 0.0
            ),
            transpiration_kg_per_hour=weighted_values.get(
                "transpiration_kg_per_hour", 0.0
            ),
            latent_heat_flux_w_m2_leaf=weighted_values.get(
                "latent_heat_flux_w_m2_leaf", 0.0
            ),
            sensible_heat_flux_w_m2_leaf=weighted_values.get(
                "sensible_heat_flux_w_m2_leaf", 0.0
            ),
            incident_shortwave_flux_w_m2_leaf=weighted_values.get(
                "incident_shortwave_flux_w_m2_leaf", 0.0
            ),
            net_radiation_flux_w_m2_leaf=weighted_values.get(
                "net_radiation_flux_w_m2_leaf", 0.0
            ),
            longwave_emission_flux_w_m2_leaf=weighted_values.get(
                "longwave_emission_flux_w_m2_leaf", 0.0
            ),
            leaf_temperature_c=weighted_values.get("leaf_temperature_c"),
            stomatal_conductance_mol_m2_s=weighted_values.get(
                "stomatal_conductance_mol_m2_s"
            ),
            reference_panel_area_m2=panel_area_m2,
            total_leaf_area_m2=total_leaf_area_m2,
            has_transpiration_data=True,
            has_thermal_flux_data=True,
            energy_balance_failed_leaf_fraction=weighted_values.get(
                "energy_balance_failed_leaf_fraction"
            ),
        )

    def get_net_co2_exchange_g_per_hour(self, **kwargs: float) -> float:
        """Compatibility wrapper for callers that only require CO2 exchange."""
        return self.get_response(**kwargs).net_co2_exchange_g_per_hour
