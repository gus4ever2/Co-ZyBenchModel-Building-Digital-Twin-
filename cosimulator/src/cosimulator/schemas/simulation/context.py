"""Top-level immutable request context for one simulation run."""

from pydantic import BaseModel

from cosimulator.schemas.simulation.co2_control import CO2Control
from cosimulator.schemas.simulation.open_windows import OpenWindows
from cosimulator.schemas.simulation.plant import PlantSimulation


class SimulationContext(BaseModel):
    """Every user choice needed to prepare the IDF and run EnergyPlus."""

    city: str  # Selects weather data and plant-profile context.
    construction_set: str  # Snapshot label selected by the user.
    plant_simulation: PlantSimulation | None = None
    open_windows: OpenWindows | None = None
    co2_control: CO2Control | None = None
