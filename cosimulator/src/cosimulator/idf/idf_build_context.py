"""Define per-simulation inputs shared by IDF configurators."""

from cosimulator.database.dto.idf_preparation_dto import IdfPreparationDTO
from cosimulator.schemas.simulation_context import SimulationContext


class IdfBuildContext(SimulationContext):
    """Simulation settings and the immutable construction snapshot for this build."""

    idf_preparation: IdfPreparationDTO  # Immutable construction set and object definitions captured for this run.
