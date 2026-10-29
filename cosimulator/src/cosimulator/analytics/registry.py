"""The deliberately small list of standard analytics."""

from cosimulator.analytics.calculations.building import (
    BuildingData, calculate_building, create_building_result,
)
from cosimulator.analytics.calculations.energy import (
    EnergyData, calculate_energy, create_energy_result,
)
from cosimulator.analytics.calculations.green_wall import (
    GreenWallData, calculate_green_wall, create_green_wall_result,
)
from cosimulator.analytics.calculations.co2 import (
    Co2Data,
    calculate_co2,
    create_co2_result,
)
from cosimulator.analytics.calculations.occupancy import (
    OccupancyData,
    calculate_occupancy,
    create_occupancy_result,
)
from cosimulator.analytics.calculations.people_co2 import (
    PeopleCo2Data,
    calculate_people_co2,
    create_people_co2_result,
)
from cosimulator.analytics.calculations.temperature import (
    TemperatureData,
    calculate_temperature,
    create_temperature_result,
)
from cosimulator.analytics.calculations.ventilation import (
    VentilationData,
    calculate_ventilation,
    create_ventilation_result,
)

# One entry means: response name, state constructor, per-timestep calculation,
# final Pydantic result constructor, and whether its state must survive across
# the simulations of a comparison request. There is no class registry.
# This is intentionally a plain list. Adding a standard analytic means adding
# one readable line here, not registering or subclassing an implementation.
ANALYTICS = [
    ("energy", EnergyData, calculate_energy, create_energy_result, False),
    ("co2", Co2Data, calculate_co2, create_co2_result, True),
    (
        "temperature",
        TemperatureData,
        calculate_temperature,
        create_temperature_result,
        False,
    ),
    ("occupancy", OccupancyData, calculate_occupancy, create_occupancy_result, False),
    ("building", BuildingData, calculate_building, create_building_result, False),
    (
        "green_wall",
        GreenWallData,
        calculate_green_wall,
        create_green_wall_result,
        False,
    ),
    (
        "ventilation",
        VentilationData,
        calculate_ventilation,
        create_ventilation_result,
        True,
    ),
    (
        "people_co2",
        PeopleCo2Data,
        calculate_people_co2,
        create_people_co2_result,
        False,
    ),
]


def select(ids: list[str] | None = None):
    """Return all analytics, or only the explicitly requested response names."""
    selected = (
        ANALYTICS
        if ids is None
        else [entry for entry in ANALYTICS if entry[0] in ids]
    )
    if ids is not None and len(selected) != len(ids):
        raise ValueError("Unknown analytic requested")
    return [entry[:4] for entry in selected]


def comparison_ids() -> list[str]:
    """Return analytics whose own state handles cross-simulation comparison."""
    return [name for name, *_, persists in ANALYTICS if persists]


def available() -> list[dict[str, str]]:
    """Keep the existing endpoint's object-list shape without schema machinery."""
    return [{"id": name, "mode": "batch"} for name, *_ in ANALYTICS]
