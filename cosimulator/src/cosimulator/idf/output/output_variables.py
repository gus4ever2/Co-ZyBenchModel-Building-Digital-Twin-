"""Register the output-variable configuration step."""

from eppy.modeleditor import IDF

from cosimulator.idf.output.add_output_variable_requests import add_output_variables
from cosimulator.idf.idf_build_context import IdfBuildContext
from cosimulator.idf.idf_configurator import IdfConfigurator
from cosimulator.schemas.simulation_context import SimulationContext


def output_variables(idf: IDF, context: SimulationContext) -> None:
    add_output_variables(idf=idf)  # Install the output requests used by downstream simulation results.


class OutputVariablesConfigurator(IdfConfigurator):
    """Install every requested EnergyPlus output variable."""

    def configure(self, *, idf: IDF, context: IdfBuildContext) -> None:
        output_variables(idf=idf, context=context)
