"""Coordinate AirflowNetwork configuration for a simulation."""

from eppy.modeleditor import IDF

from cosimulator.idf.airflow.add_airflow_cracks import add_airflow_cracks
from cosimulator.idf.airflow.add_open_windows import add_open_windows
from cosimulator.idf.utils.find_every_thermal_zone_name import find_every_thermal_zone_name
from cosimulator.idf.idf_build_context import IdfBuildContext
from cosimulator.idf.idf_configurator import IdfConfigurator
from cosimulator.schemas.simulation_context import SimulationContext


def airflow_network(idf: IDF, context: SimulationContext) -> None:
    """Configure the AirflowNetwork for this simulation's building."""
    zones = find_every_thermal_zone_name(idf=idf)  # Discover zones from this simulation's building, not from a cached template.
    add_airflow_cracks(idf=idf)  # Configure the network and connect exterior envelope cracks.
    add_open_windows(idf=idf, zone_names=zones)  # Add opening components and the eligible airflow-network zones.


class AirflowNetworkConfigurator(IdfConfigurator):
    """Configure all AirflowNetwork objects for the current simulation."""

    def configure(self, *, idf: IDF, context: IdfBuildContext) -> None:
        airflow_network(idf=idf, context=context)
