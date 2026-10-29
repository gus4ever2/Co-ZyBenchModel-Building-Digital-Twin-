"""Request the EnergyPlus output variables consumed by the simulator."""

from eppy.modeleditor import IDF

from cosimulator.core.logger.logging import logger
from cosimulator.idf.insert_idf_model import insert_idf_model
from cosimulator.idf.output.model.output_variable import OutputVariable
from cosimulator.simulation_variables.variables.mapper import (
    OUTPUT_VARIABLE_MAPPING
)

def add_output_variables(
        idf: IDF,
        reporting_frequency: str = "Timestep",
) -> IDF:
    """
    Adds Output:Variable objects to an IDF.

    Returns
    -------
    IDF
        Modified IDF object.
    """

    object_type = "OUTPUT:VARIABLE"  # EnergyPlus object type requesting one output series.
    idf.removeallidfobjects(object_type) # Remove every output variable
    logger.info(
        "Removed `OUTPUT:VARIABLE` objects",
    )

    # Add all the output variables defined in the Mapper

    output_variable_name:str = "None"  # Tracks the current mapping entry for error logging.

    try:
        for output_variable_name in OUTPUT_VARIABLE_MAPPING:  # Request every variable needed by the simulation's result mapping.

            insert_idf_model(idf, object_type, OutputVariable(
                Key_Value="*", Variable_Name=output_variable_name,  # Use all applicable objects for this EnergyPlus variable.
                Reporting_Frequency=reporting_frequency))  # Request samples at the selected interval, normally every timestep.

            logger.info(
                f"Added `OUTPUT:VARIABLE`: "
                f"Key Value: '*', "
                f"Variable Name: '{output_variable_name}', "
                f"Reporting Frequency: '{reporting_frequency}'"
            )

    except Exception as err:
        logger.exception(
            f"Failed to add `OUTPUT:VARIABLE`: "
            f"Variable Name: `{output_variable_name}` "
            f"Error: {err} "
        )
        raise

    return idf
