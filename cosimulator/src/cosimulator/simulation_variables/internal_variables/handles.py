from ctypes import c_void_p
from energyplus_api_helpers.import_helper import EPlusAPIHelper

from cosimulator.core.logger.logging import logger
from cosimulator.simulation_variables.internal_variables.mapper import INTERNAL_VARIABLE_MAPPING
from cosimulator.simulation_variables.internal_variables.values import ZoneInternalVariableHandles


def _get_internal_variable_handle(
    *,
    ep: EPlusAPIHelper,
    state: c_void_p,
    variable_type: str,
    variable_key: str,
) -> int:
    try:
        handle = (
            ep.exchange.get_internal_variable_handle(
                state=state,
                variable_type=variable_type,
                variable_key=variable_key,
            )
        )

        if handle == -1:
            logger.warning(
                "Failed to get internal variable handle: "
                "variable_type='%s', variable_key='%s'",
                variable_type,
                variable_key,
            )
        else:
            logger.info(
                "Got internal variable handle: "
                "variable_type='%s', variable_key='%s', "
                "handle=%s",
                variable_type,
                variable_key,
                handle,
            )

        return handle

    except Exception:
        logger.exception(
            "Exception while getting internal variable handle: "
            "variable_type='%s', variable_key='%s'",
            variable_type,
            variable_key,
        )

        return -1


def get_handles_for_zone_internal_variables(
    *,
    ep: EPlusAPIHelper,
    state: c_void_p,
    zone_names: set[str],
) -> dict[str, ZoneInternalVariableHandles]:
    zone_internal_variable_handles_dict = {}

    for zone_name in zone_names:

        zone_internal_variable_handles = (
            ZoneInternalVariableHandles(
                zone_name=zone_name,
            )
        )

        for (
            internal_variable_name,
            definition,
        ) in INTERNAL_VARIABLE_MAPPING.items():
            handle = _get_internal_variable_handle(
                ep=ep,
                state=state,
                variable_type=internal_variable_name,
                variable_key=zone_name,
            )

            setattr(
                zone_internal_variable_handles,
                definition.result_field,
                handle,
            )


        zone_internal_variable_handles_dict[zone_name] = zone_internal_variable_handles

    return zone_internal_variable_handles_dict
