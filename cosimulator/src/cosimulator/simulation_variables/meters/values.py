from cosimulator.simulation_variables.meters.mapper import METER_MAPPING
from cosimulator.simulation_variables.meters.meters import MeterHandles, MeterValues
from cosimulator.core.logger.logging import logger
from ctypes import c_void_p
from energyplus_api_helpers.import_helper import EPlusAPIHelper


def get_meter_values(
        *,
        ep: EPlusAPIHelper,
        state: c_void_p,
        meter_handles: MeterHandles | None,
) -> MeterValues:

    meter_values = MeterValues()

    meter_name = None
    handle = None

    try:

        for meter_name, meter_definition in METER_MAPPING.items():

            handle = getattr(
                meter_handles,
                meter_definition.result_field
            )

            if handle == -1:
                logger.warning(
                    f"Invalid output variable handle: "
                    f"Meter Name: '{meter_name}', "
                )
            else:

                value = ep.exchange.get_meter_value(
                    state=state,
                    meter_handle=handle,
                )

                attribute_name = meter_definition.result_field

                setattr(
                    meter_values,
                    attribute_name,
                    value,
                )

    except Exception as e:
        logger.exception(
            f"Failed to get output variable value: "
            f"Meter Name: '{meter_name}', "
            f"handle: {handle}, "
            f"error: '{e}'"
        )
        raise

    return meter_values

