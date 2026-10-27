"""Register the zone CO2 balance configuration step."""

from eppy.modeleditor import IDF

from cosimulator.idf.co2_control.add_co2_balance import add_co2_balance
from cosimulator.idf.idf_build_context import IdfBuildContext
from cosimulator.idf.idf_configurator import IdfConfigurator
from cosimulator.schemas.simulation_context import SimulationContext


def co2_balance(idf: IDF, context: SimulationContext) -> None:
    add_co2_balance(idf=idf)  # Enable the zone CO2 balance and its outdoor concentration schedule.


class CO2BalanceConfigurator(IdfConfigurator):
    """Enable the common zone CO2-balance objects."""

    def configure(self, *, idf: IDF, context: IdfBuildContext) -> None:
        co2_balance(idf=idf, context=context)
