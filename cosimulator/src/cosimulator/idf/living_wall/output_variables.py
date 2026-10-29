"""Request native wall diagnostics in EnergyPlus output files."""

from cosimulator.idf.living_wall.schedules import PREFIX

LIVING_WALL_OUTPUT_VARIABLES = (
    "Indoor Living Wall Plant Surface Temperature",
    "Indoor Living Wall Sensible Heat Gain Rate",
    "Indoor Living Wall Latent Heat Gain Rate",
    "Indoor Living Wall Evapotranspiration Rate",
    "Indoor Living Wall Energy Rate Required For Evapotranspiration Per Unit Area",
    "Indoor Living Wall PPFD",
    "Indoor Living Wall LED Operational Power",
)


def remove_living_wall_output_requests(idf) -> None:
    """Remove only this package's diagnostic requests before rebuilding."""
    for obj in list(idf.idfobjects["OUTPUT:VARIABLE"]):
        if ((str(obj.Key_Value) == "*" or str(obj.Key_Value).startswith(PREFIX))
                and str(obj.Variable_Name) in LIVING_WALL_OUTPUT_VARIABLES):
            idf.removeidfobject(obj)


def add_living_wall_output_requests(idf) -> None:
    """Use wildcard keys so zone names containing regex punctuation also match."""
    for variable in LIVING_WALL_OUTPUT_VARIABLES:
        idf.newidfobject("OUTPUT:VARIABLE", Key_Value="*",
                        Variable_Name=variable, Reporting_Frequency="Timestep")
