from ctypes import c_void_p
from energyplus_api_helpers.import_helper import EPlusAPIHelper
from cosimulator.core.logger.logging import logger
from cosimulator.simulation_variables.meters.mapper import METER_MAPPING
from cosimulator.simulation_variables.meters.meters import MeterHandles


def _get_meter_handle(
        *,
        ep: EPlusAPIHelper,
        state: c_void_p,
        meter_name: str,
) -> int:

    try:
        handle = ep.exchange.get_meter_handle(
            state=state,
            meter_name=meter_name,
        )

        if handle == -1:
            logger.warning(
                f"Failed to get output variable handle: "
                f"Meter Name: '{meter_name}', "
            )
        else:
            logger.info(
                f"Got output variable handle: "
                f"Meter Name: '{meter_name}', "
                f"handle: {handle}"
            )

        return handle

    except Exception as e:
        logger.exception(
            f"Exception while getting output variable handle: "
            f"Meter Name: '{meter_name}', "
            f"error='{e}'"
        )
        return -1


def get_handles_for_meters(
        *,
        ep: EPlusAPIHelper,
        state: c_void_p,
) -> MeterHandles:

    meter_handles = MeterHandles()

    for meter_name, meter_definition in METER_MAPPING.items():

        handle = _get_meter_handle(
            ep=ep,
            state=state,
            meter_name=meter_name,
        )

        attribute_name = meter_definition.result_field

        setattr(
            meter_handles,
            attribute_name,
            handle,
        )

        if handle == -1:
            logger.warning(
                f"Unknown output variable type: "
                f"Meter Name: '{meter_name}', "
            )

    return meter_handles
