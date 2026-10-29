from ctypes import c_void_p

from energyplus_api_helpers.import_helper import EPlusAPIHelper

from cosimulator.core.logger.logging import logger
from cosimulator.simulation.case_study.plant.plant_control_models import ZonePlantActuatorHandles


def get_plant_actuator_handles(
    *, ep: EPlusAPIHelper, state: c_void_p, zone_names: set[str],
) -> dict[str, ZonePlantActuatorHandles]:
    """Resolve only the PhotosynEB CO2 sink/source schedules per zone."""
    handles_by_zone: dict[str, ZonePlantActuatorHandles] = {}
    for zone_name in zone_names:
        sink_schedule_name = f"{zone_name} CO2 Sink Schedule"
        source_schedule_name = f"{zone_name} CO2 Source Schedule"
        sink_handle = ep.exchange.get_actuator_handle(
            state, "Schedule:Constant", "Schedule Value", sink_schedule_name
        )
        source_handle = ep.exchange.get_actuator_handle(
            state, "Schedule:Constant", "Schedule Value", source_schedule_name
        )
        if sink_handle == -1 or source_handle == -1:
            logger.warning(
                "Plant CO2 actuators missing for zone '%s': sink=%s, source=%s",
                zone_name, sink_handle, source_handle,
            )
            continue
        handles_by_zone[zone_name] = ZonePlantActuatorHandles(
            zone_name=zone_name,
            sink_schedule_name=sink_schedule_name, sink_handle=sink_handle,
            source_schedule_name=source_schedule_name, source_handle=source_handle,
        )
    return handles_by_zone
