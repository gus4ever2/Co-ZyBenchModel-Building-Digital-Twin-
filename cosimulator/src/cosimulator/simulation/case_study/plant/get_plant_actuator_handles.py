from ctypes import c_void_p

from energyplus_api_helpers.import_helper import EPlusAPIHelper

from cosimulator.core.logger.logging import logger
from cosimulator.idf.equipment.plant_loads import PREFIX
from cosimulator.simulation.case_study.plant.plant_control_models import (
    ZonePlantActuatorHandles,
)


def get_plant_actuator_handles(
    *,
    ep: EPlusAPIHelper,
    state: c_void_p,
    zone_names: set[str],
) -> dict[str, ZonePlantActuatorHandles]:
    """Resolve CO2 and PhotosynEB thermal-load schedule actuators per zone."""
    handles_by_zone: dict[str, ZonePlantActuatorHandles] = {}  # Valid zones.
    for zone_name in zone_names:
        # These names are created while the IDF receives the plant equipment.
        sink_schedule_name = f"{zone_name} CO2 Sink Schedule"
        source_schedule_name = f"{zone_name} CO2 Source Schedule"
        latent_load_schedule_name = f"{PREFIX}{zone_name} Plant Latent Load"
        sensible_load_schedule_name = f"{PREFIX}{zone_name} Plant Sensible Load"
        # Each Schedule:Constant actuator receives the live physical value.
        sink_handle = ep.exchange.get_actuator_handle(
            state, "Schedule:Constant", "Schedule Value", sink_schedule_name
        )
        source_handle = ep.exchange.get_actuator_handle(
            state, "Schedule:Constant", "Schedule Value", source_schedule_name
        )
        latent_load_handle = ep.exchange.get_actuator_handle(
            state, "Schedule:Constant", "Schedule Value", latent_load_schedule_name
        )
        sensible_load_handle = ep.exchange.get_actuator_handle(
            state, "Schedule:Constant", "Schedule Value", sensible_load_schedule_name
        )
        if (
            sink_handle == -1
            or source_handle == -1
            or latent_load_handle == -1
            or sensible_load_handle == -1
        ):
            logger.warning(
                "Plant actuators were not found for zone '%s': sink=%s, source=%s, "
                "latent=%s, sensible=%s",
                zone_name,
                sink_handle,
                source_handle,
                latent_load_handle,
                sensible_load_handle,
            )
            continue
        # Store names too: they make missing-handle diagnostics meaningful.
        handles_by_zone[zone_name] = ZonePlantActuatorHandles(
            zone_name=zone_name,
            sink_schedule_name=sink_schedule_name,
            sink_handle=sink_handle,
            source_schedule_name=source_schedule_name,
            source_handle=source_handle,
            latent_load_schedule_name=latent_load_schedule_name,
            latent_load_handle=latent_load_handle,
            sensible_load_schedule_name=sensible_load_schedule_name,
            sensible_load_handle=sensible_load_handle,
        )
    return handles_by_zone
