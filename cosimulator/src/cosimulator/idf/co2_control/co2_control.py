"""Configure demand-controlled ventilation when requested."""

from eppy.modeleditor import IDF

from cosimulator.idf.co2_control.configure_dcv import configure_co2_dcv
from cosimulator.idf.utils.find_every_thermal_zone_name import find_every_thermal_zone_name
from cosimulator.idf.idf_build_context import IdfBuildContext
from cosimulator.idf.idf_configurator import IdfConfigurator
from cosimulator.schemas.simulation_context import SimulationContext


def co2_control(idf: IDF, context: SimulationContext) -> None:
    if context.co2_control is not None:  # Only configure demand-controlled ventilation when the user selected it.
        configure_co2_dcv(idf=idf, zone_names=find_every_thermal_zone_name(idf=idf),
                          setpoint_ppm=context.co2_control.setpoint_ppm)


class CO2ControlConfigurator(IdfConfigurator):
    """Configure demand-controlled ventilation when selected."""

    def configure(self, *, idf: IDF, context: IdfBuildContext) -> None:
        co2_control(idf=idf, context=context)
