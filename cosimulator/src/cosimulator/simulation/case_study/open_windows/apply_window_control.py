from ctypes import c_void_p

from energyplus_api_helpers.import_helper import EPlusAPIHelper

from cosimulator.core.logger.logging import logger
from cosimulator.schemas.simulation_context import OpenWindows, WindowOpeningStrategy
from cosimulator.simulation_variables.schemas.handles import SimulationHandles
from cosimulator.simulation_variables.schemas.results import SimulationTimestepResult
from cosimulator.simulation.case_study.open_windows.calculate_window_opening_factor import (
    calculate_temperature_suitability_factor,
)
from cosimulator.simulation.case_study.open_windows.set_window_opening_factor import (
    set_window_opening_factor,
)
from cosimulator.simulation.case_study.open_windows.window_control_models import (
    ZoneWindowActuatorHandles,
    ZoneWindowOpeningResult,
)


def apply_window_control(
        *,
        ep: EPlusAPIHelper,
        state: c_void_p,
        simulation_handles: SimulationHandles,
        actuator_handles_by_zone: dict[str, ZoneWindowActuatorHandles],
        timestep_result: SimulationTimestepResult,
        settings: OpenWindows,
) -> dict[str, ZoneWindowOpeningResult]:
    """Calculate and apply one opening factor per controllable thermal zone."""
    # The result is keyed by zone so it maps directly to the stored timestep.
    opening_results: dict[str, ZoneWindowOpeningResult] = {}

    for zone_name, actuator_handles in actuator_handles_by_zone.items():
        zone_handles = simulation_handles.zone_handles.get(zone_name)
        zone_result = timestep_result.zone_results.get(zone_name)

        if zone_handles is None or zone_result is None:
            logger.warning(
                "Window control data was not found for zone '%s'",
                zone_name,
            )
            continue

        if (
            zone_handles.cooling_setpoint_c == -1
            or zone_handles.heating_setpoint_c == -1
        ):
            logger.warning(
                "Heating or cooling setpoint handle was not found "
                "for zone '%s'",
                zone_name,
            )
            continue

        # Closed is the safe default whenever one control condition fails.
        opening_factor = 0.0

        # CO2 enables the control. Both indoor and outdoor temperatures
        # must be suitable for the current thermostat setpoints.
        if zone_result.co2_concentration_ppm >= settings.co2_threshold_ppm:
            indoor_temperature_factor = (
                calculate_temperature_suitability_factor(
                    temperature_c=zone_result.zone_air_temp_c,
                    heating_setpoint_c=zone_result.heating_setpoint_c,
                    cooling_setpoint_c=zone_result.cooling_setpoint_c,
                    temperature_margin_c=settings.temperature_margin_c,
                    opening_strategy=settings.opening_strategy,
                )
            )
            outdoor_temperature_factor = (
                calculate_temperature_suitability_factor(
                    temperature_c=timestep_result.outdoor_air_temp_c,
                    heating_setpoint_c=zone_result.heating_setpoint_c,
                    cooling_setpoint_c=zone_result.cooling_setpoint_c,
                    temperature_margin_c=settings.temperature_margin_c,
                    opening_strategy=settings.opening_strategy,
                )
            )
            # The smaller factor is the limiting indoor/outdoor condition.
            opening_factor = min(
                indoor_temperature_factor,
                outdoor_temperature_factor,
            )
            if settings.opening_strategy is WindowOpeningStrategy.FIXED_PERCENTAGE:
                # The percentage is a 0–100 user value; EnergyPlus expects 0–1.
                # Both temperature checks above are binary for this strategy.
                opening_factor *= settings.opening_percentage / 100.0

        opening_results[zone_name] = set_window_opening_factor(
            ep=ep,
            state=state,
            zone_actuator_handles=actuator_handles,
            opening_factor=opening_factor,
        )

    return opening_results
