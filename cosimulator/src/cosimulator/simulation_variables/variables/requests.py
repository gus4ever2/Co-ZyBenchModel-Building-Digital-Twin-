from ctypes import c_void_p
from logging import Logger
from energyplus_api_helpers.import_helper import EPlusAPIHelper
from cosimulator.simulation_variables.variables.mapper import (
    OUTPUT_VARIABLE_MAPPING,
    SYSTEM_NODE_OUTPUT_VARIABLES,
    find_variable_key_values,
)
from cosimulator.simulation_variables.variables.zone_air_nodes import ZoneAirNodes


def _output_variable_request(
        *,
        ep:EPlusAPIHelper,
        state: c_void_p,
        variable_name: str,
        variable_key: str,
        logger: Logger
) -> None:

    try:
        ep.exchange.request_variable(
            state=state,
            variable_name=variable_name,
            variable_key=variable_key,
        )
        logger.info(
            f"Output variable `{variable_name}` request happened "
            f"variable_key='{variable_key}'"
        )
    except ValueError:
        logger.error(
            f"Output variable request dont happened"
            f"variable_name='{variable_name}', "
            f"variable_key='{variable_key}'"
        )



def request_output_variables(
        *,
        ep: EPlusAPIHelper,
        state: c_void_p,
        logger: Logger,
        zone_names: set[str],
        air_loop_names: set[str],
        zone_air_nodes: dict[str, ZoneAirNodes] | None = None,
) -> None:

    for variable_name, variable_meta_data in OUTPUT_VARIABLE_MAPPING.items():

        variable_types = find_variable_key_values(
            zone_names=zone_names,
            air_loop_names=air_loop_names,
            key_type=variable_meta_data.key_type,
            key_suffix=variable_meta_data.key_suffix or "People",
        )

        for variable_type in variable_types:


            _output_variable_request(
                ep=ep,
                state=state,
                variable_name=variable_name,
                variable_key=variable_type,
                logger=logger,
            )

    for air_nodes in (zone_air_nodes or {}).values():
        for node_name in (*air_nodes.supply, *air_nodes.return_air):
            for variable_name in SYSTEM_NODE_OUTPUT_VARIABLES:
                _output_variable_request(
                    ep=ep,
                    state=state,
                    variable_name=variable_name,
                    variable_key=node_name,
                    logger=logger,
                )
