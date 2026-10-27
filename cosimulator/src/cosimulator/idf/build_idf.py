"""Build and save the configured IDF for a single simulation."""

from eppy.modeleditor import IDF

from cosimulator.database.dto.idf_preparation_dto import IdfPreparationDTO
from cosimulator.idf.idf_build_context import IdfBuildContext
from cosimulator.idf.idf_file_operations import load_input_idf, save_temp_idf, set_energyplus_idd
from cosimulator.idf.registry import IDF_CONFIGURATORS
from cosimulator.schemas.simulation_context import SimulationContext


def select_idf_objects(*, idf: IDF, simulation_context: IdfBuildContext) -> IDF:
    """Apply every registered package in order to this simulation's IDF."""
    for configure in IDF_CONFIGURATORS:  # Registry order is significant: later steps use objects created by earlier steps.
        configure(idf, simulation_context)  # Each configurator modifies this simulation's working IDF in place.
    return idf


def build_idf(
    *,
    simulation_id: str,
    idf_preparation_dto: IdfPreparationDTO,
    simulation_context: SimulationContext,
) -> None:
    """Create and save a fresh configured IDF file for this simulation."""
    set_energyplus_idd()  # Load the EnergyPlus object definitions before reading any IDF.
    idf = load_input_idf()  # Create a fresh working model instead of modifying the input template.
    context = IdfBuildContext(
        **simulation_context.model_dump(),  # Carry the user's selections into the per-build context.
        idf_preparation=idf_preparation_dto,  # Attach the saved construction snapshot for the construction-set step.
    )
    select_idf_objects(idf=idf, simulation_context=context)  # Run every configuration package against the same working model.
    save_temp_idf(idf=idf, simulation_id=simulation_id)  # Write the completed model in this simulation's workspace.
