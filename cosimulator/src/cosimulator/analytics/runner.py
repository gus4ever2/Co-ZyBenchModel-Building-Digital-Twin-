"""Run the ordinary, single-simulation analytics over a MongoDB cursor."""

from collections.abc import Iterable
from typing import Any

from cosimulator.analytics.contracts import AnalyticsInput, AnalyticsResponse
from cosimulator.analytics.data import iter_inputs
from cosimulator.analytics.registry import comparison_ids, select


def create_states(selected: list[str] | None = None) -> list[tuple]:
    """Create one small mutable data object for every selected analytic."""
    return [
        (name, data_class(), calculate, create_result)
        for name, data_class, calculate, create_result in select(selected)
    ]


def create_comparison_states() -> dict[str, tuple]:
    """Create only analytics that keep their own state across simulations."""
    return {
        name: (name, data_class(), calculate, create_result)
        for name, data_class, calculate, create_result in select(comparison_ids())
    }


def calculate_timestep(timestep: AnalyticsInput, states: list[tuple]) -> None:
    """Give one input timestep to every ordinary analytic calculation."""
    for _, data, calculate, _ in states:
        calculate(timestep, data)


def create_response(simulation_id: str, states: list[tuple]) -> AnalyticsResponse:
    """Build the final API response from the completed analytic states."""
    results = {
        name: create_result(data).model_dump()
        for name, data, _, create_result in states
    }
    metrics = _metrics(results)
    _add_energy_intensity(results, metrics)
    return AnalyticsResponse(
        simulationId=simulation_id,
        results=results,
        metrics=metrics,
        zones=_zones(results),
    )


def run(
    simulation_id: str,
    documents: Iterable[dict[str, Any]],
    selected: list[str] | None = None,
    persistent_states: dict[str, tuple] | None = None,
) -> AnalyticsResponse:
    """Read one simulation and return only its ordinary analytic results."""
    states = create_states(selected)
    if persistent_states:
        states = [persistent_states.get(state[0], state) for state in states]

    # Every calculation sees the same input object. Its own data object is the
    # only state that survives into the next timestep.
    for timestep in iter_inputs(documents, simulation_id):
        calculate_timestep(timestep, states)

    return create_response(simulation_id, states)


def _zones(results: dict[str, dict]) -> dict[str, dict]:
    """Merge the existing per-zone geometry, plant and people-CO2 fields."""
    zones = {name: dict(values) for name, values in results.get("building", {}).get("byZone", {}).items()}
    for result_name, field_name in (("green_wall", "meanGreenWallAreaM2"), ("people_co2", "meanPeopleCo2GenerationPpmPerHour")):
        for zone_name, value in results.get(result_name, {}).get("byZone", {}).items():
            zones.setdefault(zone_name, {})[field_name] = value
    return zones


def _metrics(results: dict[str, dict]) -> dict[str, float | int | None]:
    """Keep the flat metrics structure consumed by the existing frontend."""
    return {
        key: value
        for result in results.values()
        for key, value in result.items()
        if value is None or isinstance(value, (int, float))
    }


def _add_energy_intensity(results: dict[str, dict], metrics: dict[str, float | int | None]) -> None:
    """Derive simple HVAC intensities from completed energy and geometry results."""
    energy = results.get("energy", {}).get("totalHvacKwh")
    building = results.get("building", {})
    area = building.get("totalFloorAreaM2")
    volume = building.get("totalVolumeM3")
    intensity = {
        "hvacKwhPerM2": energy / area if energy is not None and area else None,
        "hvacKwhPerM3": energy / volume if energy is not None and volume else None,
    }
    results["energy_intensity"] = intensity
    metrics.update(intensity)
