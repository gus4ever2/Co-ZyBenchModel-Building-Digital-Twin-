from ctypes import c_void_p

from energyplus_api_helpers.import_helper import EPlusAPIHelper
from eppy.modeleditor import IDF

from cosimulator.core.logger.logging import logger
from cosimulator.idf.airflow.find_exterior_windows_by_zone import (
    find_exterior_window_names_by_zone,
)
from cosimulator.simulation.case_study.open_windows.window_control_models import (
    WindowActuatorHandle,
    ZoneWindowActuatorHandles,
)


def get_window_actuator_handles(
    *,
    ep: EPlusAPIHelper,
    state: c_void_p,
    idf: IDF,
) -> dict[str, ZoneWindowActuatorHandles]:
    """Resolve one AFN opening-factor actuator for each exterior window."""
    # The IDF decides which windows are exterior and which zone owns them.
    windows_by_zone = find_exterior_window_names_by_zone(idf=idf)
    actuator_handles_by_zone: dict[
        str,
        ZoneWindowActuatorHandles,
    ] = {}

    for zone_name, window_names in windows_by_zone.items():
        window_actuators: list[WindowActuatorHandle] = []  # One per window.

        for window_name in window_names:
            # This E+ actuator receives a dimensionless opening factor [0, 1].
            handle = ep.exchange.get_actuator_handle(
                state,
                "AirFlow Network Window/Door Opening",
                "Venting Opening Factor",
                window_name,
            )

            if handle == -1:
                logger.warning(
                    "Window actuator was not found: "
                    "zone='%s', window='%s'",
                    zone_name,
                    window_name,
                )
                continue

            window_actuators.append(
                WindowActuatorHandle(
                    window_name=window_name,
                    handle=handle,
                )
            )

        # Keep the zone even if no valid actuator was found; the result then
        # makes the absence explicit without failing the entire simulation.
        actuator_handles_by_zone[zone_name] = (
            ZoneWindowActuatorHandles(
                zone_name=zone_name,
                window_actuators=tuple(window_actuators),
            )
        )

    return actuator_handles_by_zone
