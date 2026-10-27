"""Build the validated MongoDB result owned by the plant case study."""

from dataclasses import asdict

from cosimulator.simulation.case_study.plant.plant_timestep_result import (
    PlantTimestepResult,
    ZonePlantCO2ExchangeValue,
)
from cosimulator.simulation_variables.schemas.results import (
    SimulationTimestepResult,
)


def build_plant_timestep_result(
    *,
    timestep_result: SimulationTimestepResult,
) -> PlantTimestepResult:
    """Convert runtime plant results into their Pydantic persistence model."""
    # ``apply_plant_control`` creates runtime dataclasses because they are
    # convenient beside the EnergyPlus API. This is the sole boundary where
    # they become validated data intended for MongoDB.
    return PlantTimestepResult(
        plant_co2_exchange_results={
            zone_name: ZonePlantCO2ExchangeValue(**asdict(result))
            for zone_name, result in (
                timestep_result.plant_co2_exchange_results.items()
            )
        },
    )
