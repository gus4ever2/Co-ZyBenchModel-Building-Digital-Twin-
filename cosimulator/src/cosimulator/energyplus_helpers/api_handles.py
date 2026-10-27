from cosimulator.simulation_variables.internal_variables.handles import get_handles_for_zone_internal_variables
from cosimulator.simulation_variables.meters.handles import get_handles_for_meters
from cosimulator.simulation_variables.variables.handles import get_handles_for_system_node_output_variables, get_handles_for_zone_output_variables
from cosimulator.simulation_variables.schemas.handles import SimulationHandles
from cosimulator.simulation_variables.variables.zone_air_nodes import ZoneAirNodes
from ctypes import c_void_p
from energyplus_api_helpers.import_helper import EPlusAPIHelper


def get_handles(
        *,
        ep: EPlusAPIHelper,
        state: c_void_p,
        zone_names: set[str],
        air_loop_names: set[str],
        zone_air_nodes: dict[str, ZoneAirNodes],
) -> SimulationHandles:

    simulation_handles = get_handles_for_zone_output_variables(
        ep=ep,
        state=state,
        zone_names=zone_names,
        air_loop_names=air_loop_names,
    )

    simulation_handles.zone_internal_variable_handles = get_handles_for_zone_internal_variables(
        ep=ep,
        state=state,
        zone_names=zone_names,
    )

    get_handles_for_system_node_output_variables(
        ep=ep,
        state=state,
        simulation_handles=simulation_handles,
        zone_air_nodes=zone_air_nodes,
    )

    simulation_handles.meter_handles = get_handles_for_meters(
        ep=ep,
        state=state,
    )

    return simulation_handles
