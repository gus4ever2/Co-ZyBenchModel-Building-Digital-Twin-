"""Apply the selected location's weather design days."""

from eppy.modeleditor import IDF

from cosimulator.idf.weather.add_design_days import add_design_days
from cosimulator.idf.idf_build_context import IdfBuildContext
from cosimulator.idf.idf_configurator import IdfConfigurator
from cosimulator.schemas.simulation_context import SimulationContext


def weather(idf: IDF, context: SimulationContext) -> None:
    add_design_days(idf=idf, city=context.city)  # Copy location and sizing days for the selected weather city.


class WeatherConfigurator(IdfConfigurator):
    """Apply weather design days as one registered IDF step."""

    def configure(self, *, idf: IDF, context: IdfBuildContext) -> None:
        weather(idf=idf, context=context)
