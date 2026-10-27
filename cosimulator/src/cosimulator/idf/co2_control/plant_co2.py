"""Register plant CO2 sources and sinks when a plant is selected."""

from eppy.modeleditor import IDF

from cosimulator.idf.utils.find_every_thermal_zone_name import find_every_thermal_zone_name
from cosimulator.idf.co2_control.add_plant_co2_exchange import add_plant_co2_exchange
from cosimulator.idf.idf_build_context import IdfBuildContext
from cosimulator.idf.idf_configurator import IdfConfigurator
from cosimulator.schemas.simulation_context import SimulationContext


def plant_co2(idf: IDF, context: SimulationContext) -> None:
    """Configure plant CO2 exchange only when a plant is selected."""
    if context.plant_simulation is not None:  # Create plant CO2 exchange objects only for a plant-enabled simulation.
        add_plant_co2_exchange(idf=idf, zone_names=find_every_thermal_zone_name(idf=idf))


class PlantCO2Configurator(IdfConfigurator):
    """Add plant CO2 exchange objects for plant-enabled simulations."""

    def configure(self, *, idf: IDF, context: IdfBuildContext) -> None:
        plant_co2(idf=idf, context=context)
