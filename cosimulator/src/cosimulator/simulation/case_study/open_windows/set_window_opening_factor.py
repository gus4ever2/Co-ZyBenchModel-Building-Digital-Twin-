from ctypes import c_void_p

from energyplus_api_helpers.import_helper import EPlusAPIHelper

from cosimulator.simulation.case_study.open_windows.window_control_models import (
    WindowOpeningResult,
    ZoneWindowActuatorHandles,
    ZoneWindowOpeningResult,
)


def set_window_opening_factor(
    *,
    ep: EPlusAPIHelper,
    state: c_void_p,
    zone_actuator_handles: ZoneWindowActuatorHandles,
    opening_factor: float,
) -> ZoneWindowOpeningResult:
    """Send one validated opening factor to all controlled zone windows."""
    if not 0.0 <= opening_factor <= 1.0:
        raise ValueError(
            "opening_factor must be between 0.0 and 1.0"
        )

    # The list is both an audit trail and the data used by comparison charts.
    window_results: list[WindowOpeningResult] = []

    for actuator in zone_actuator_handles.window_actuators:
        # All exterior windows in the zone follow the same calculated factor.
        ep.exchange.set_actuator_value(
            state,
            actuator.handle,
            opening_factor,
        )

        window_results.append(
            WindowOpeningResult(
                window_name=actuator.window_name,
                opening_factor=opening_factor,
            )
        )

    return ZoneWindowOpeningResult(
        zone_name=zone_actuator_handles.zone_name,
        window_results=tuple(window_results),
    )
