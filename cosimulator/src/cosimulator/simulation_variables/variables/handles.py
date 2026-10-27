from ctypes import c_void_p
from energyplus_api_helpers.import_helper import EPlusAPIHelper

from cosimulator.core.logger.logging import logger
from cosimulator.simulation_variables.variables.mapper import (
    OUTPUT_VARIABLE_MAPPING,
    SYSTEM_NODE_OUTPUT_VARIABLES,
    find_variable_key_values,
)
from cosimulator.simulation_variables.schemas.handles import (
    SimulationHandles,
    ZoneHandles,
)
from cosimulator.simulation_variables.variables.zone_air_nodes import ZoneAirNodes

def _get_output_variable_handle(
        *,
        ep: EPlusAPIHelper,
        state: c_void_p,
        variable_name: str,
        variable_key: str,
) -> int:

    try:
        handle = ep.exchange.get_variable_handle(
            state=state,
            variable_name=variable_name,
            variable_key=variable_key,
        )

        if handle == -1:
            logger.warning(
                f"Failed to get output variable handle: "
                f"variable_name='{variable_name}', "
                f"variable_key='{variable_key}'"
            )
        else:
            logger.info(
                f"Got output variable handle: "
                f"variable_name='{variable_name}', "
                f"variable_key='{variable_key}', "
                f"handle={handle}"
            )

        return handle

    except Exception as e:
        logger.exception(
            f"Exception while getting output variable handle: "
            f"variable_name='{variable_name}', "
            f"variable_key='{variable_key}', "
            f"error='{e}'"
        )
        return -1


def get_handles_for_zone_output_variables(
        *,
        ep: EPlusAPIHelper,
        state: c_void_p,
        zone_names: set[str],
        air_loop_names: set[str],
) -> SimulationHandles:

    simulation_handles = SimulationHandles()

    for output_variable_name, variable_meta_data in OUTPUT_VARIABLE_MAPPING.items():

        variable_keys = find_variable_key_values(
            zone_names=zone_names,
            air_loop_names=air_loop_names,
            key_type=variable_meta_data.key_type,
            key_suffix=variable_meta_data.key_suffix or "People",
        )

        for variable_key in variable_keys:

            handle = _get_output_variable_handle(
                ep=ep,
                state=state,
                variable_name=output_variable_name,
                variable_key=variable_key,
            )

            attribute_name = variable_meta_data.result_field

            if not variable_meta_data.is_zone_result:
                setattr(
                    simulation_handles,
                    attribute_name,
                    handle,
                )
            else:
                zone_name = variable_key
                if variable_meta_data.key_suffix is not None:
                    zone_name = zone_name.strip().removesuffix(variable_meta_data.key_suffix).strip()

                if zone_name not in simulation_handles.zone_handles:
                    simulation_handles.zone_handles[zone_name] = ZoneHandles(
                        zone_name=zone_name
                    )

                setattr(
                    simulation_handles.zone_handles[zone_name],
                    attribute_name,
                    handle,
                )

            if handle == -1:
                logger.warning(
                    f"Unknown output variable type: "
                    f"variable_name='{output_variable_name}', "
                    f"variable_type='{variable_meta_data.key_type}'"
                )

    return simulation_handles


def get_handles_for_system_node_output_variables(
        *,
        ep: EPlusAPIHelper,
        state: c_void_p,
        simulation_handles: SimulationHandles,
        zone_air_nodes: dict[str, ZoneAirNodes],
) -> None:
    """Attach native System Node output handles to their owning zone."""
    for zone_name, air_nodes in zone_air_nodes.items():
        zone_handles = simulation_handles.zone_handles.get(zone_name)
        if zone_handles is None:
            continue

        for node_name in air_nodes.supply:
            _append_node_handles(
                ep=ep,
                state=state,
                zone_handles=zone_handles,
                node_name=node_name,
                direction="supply",
            )
        for node_name in air_nodes.return_air:
            _append_node_handles(
                ep=ep,
                state=state,
                zone_handles=zone_handles,
                node_name=node_name,
                direction="return_air",
            )


def _append_node_handles(
        *,
        ep: EPlusAPIHelper,
        state: c_void_p,
        zone_handles: ZoneHandles,
        node_name: str,
        direction: str,
) -> None:
    fields = {
        definition.result_field: _get_output_variable_handle(
            ep=ep, state=state, variable_name=variable_name, variable_key=node_name
        )
        for variable_name, definition in SYSTEM_NODE_OUTPUT_VARIABLES.items()
    }
    if direction == "supply":
        if fields["temperature"] != -1:
            zone_handles.supply_air_temp_c.append(fields["temperature"])
        if fields["mass_flow"] != -1:
            zone_handles.supply_air_mass_flow_kg_s.append(fields["mass_flow"])
        if fields["co2_concentration"] != -1:
            zone_handles.supply_air_co2_ppm.append(fields["co2_concentration"])
    else:
        if fields["mass_flow"] != -1:
            zone_handles.return_air_mass_flow_kg_s.append(fields["mass_flow"])
        if fields["co2_concentration"] != -1:
            zone_handles.return_air_co2_ppm.append(fields["co2_concentration"])
