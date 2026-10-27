from ctypes import c_void_p
from dataclasses import dataclass
from energyplus_api_helpers.import_helper import EPlusAPIHelper
from cosimulator.core.logger.logging import logger
from cosimulator.simulation_variables.internal_variables.mapper import INTERNAL_VARIABLE_MAPPING


@dataclass(slots=True,  kw_only=True)
class ZoneInternalVariableHandles:
    """EnergyPlus handles for static zone properties."""

    zone_name: str = ""
    floor_area_m2: int = -1
    air_volume_m3: int = -1


@dataclass(slots=True,  kw_only=True)
class ZoneInternalVariableValues:
    """Static geometry values retrieved from EnergyPlus."""

    zone_name: str = ""
    floor_area_m2: float = 0.0
    air_volume_m3: float = 0.0



def _get_internal_variable_value(
    *,
    ep: EPlusAPIHelper,
    state: c_void_p,
    handle: int,
    variable_name: str,
    zone_name: str,
) -> float:

    if handle == -1:
        logger.warning(
            "Invalid internal variable handle: "
            "variable_name='%s', zone_name='%s'",
            variable_name,
            zone_name,
        )

        return 0.0

    try:
        value = (
            ep.exchange.get_internal_variable_value(
                state=state,
                variable_handle=handle,
            )
        )

        return float(value)

    except Exception:
        logger.exception(
            "Failed to get internal variable value: "
            "variable_name='%s', zone_name='%s', "
            "handle=%s",
            variable_name,
            zone_name,
            handle,
        )

        return 0.0


def get_zone_internal_variable_values(
    *,
    ep: EPlusAPIHelper,
    state: c_void_p,
    zone_names: set[str],
    handle_variables_dict: dict[
        str,
        ZoneInternalVariableHandles,
    ],
) -> dict[str, ZoneInternalVariableValues]:

    zone_internal_values: dict[
        str,
        ZoneInternalVariableValues,
    ] = {}

    for zone_name in zone_names:
        zone_handles = handle_variables_dict.get(
            zone_name
        )

        zone_values = ZoneInternalVariableValues(
            zone_name=zone_name,
        )

        for (
            internal_variable_name,
            definition,
        ) in INTERNAL_VARIABLE_MAPPING.items():

            handle = getattr(
                zone_handles,
                definition.result_field,
            )

            value = _get_internal_variable_value(
                ep=ep,
                state=state,
                handle=handle,
                variable_name=internal_variable_name,
                zone_name=zone_name,
            )

            setattr(
                zone_values,
                definition.result_field,
                value,
            )

        zone_internal_values[zone_name] = zone_values


    return zone_internal_values
