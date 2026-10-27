"""Ensure the schedule type limits required by the simulation."""

from eppy.modeleditor import IDF

from cosimulator.idf.insert_idf_model import insert_idf_model
from cosimulator.idf.schedule_definitions.model.fraction import Fraction
from cosimulator.idf.idf_build_context import IdfBuildContext
from cosimulator.idf.idf_configurator import IdfConfigurator
from cosimulator.schemas.simulation_context import SimulationContext


def schedule_definitions(idf: IDF, context: SimulationContext | None = None) -> None:
    """Ensure the explicitly named definitions without altering existing ones."""
    fraction = Fraction()  # Pydantic definition of the shared 0–1 continuous schedule type.
    existing = idf.idfobjects.get("SCHEDULETYPELIMITS", [])  # Inspect definitions already present in the current input IDF.
    if not any(str(item.Name).strip().casefold() == fraction.Name.casefold() for item in existing):  # EnergyPlus names are matched without case or surrounding spaces.
        insert_idf_model(idf, "SCHEDULETYPELIMITS", fraction)  # Only add the definition when the expected name is absent.


class ScheduleDefinitionsConfigurator(IdfConfigurator):
    """Ensure shared schedule definitions before dependent IDF objects exist."""

    def configure(self, *, idf: IDF, context: IdfBuildContext) -> None:
        schedule_definitions(idf=idf, context=context)
