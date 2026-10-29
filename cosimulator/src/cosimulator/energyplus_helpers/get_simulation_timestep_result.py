from ctypes import c_void_p
from datetime import datetime, timedelta

from energyplus_api_helpers.import_helper import EPlusAPIHelper

from cosimulator.simulation_variables.internal_variables.values import get_zone_internal_variable_values
from cosimulator.simulation_variables.variables.values import (
    get_environment_output_variable_values,
    populate_system_node_values,
    get_values_for_zone_output_variables,
)
from cosimulator.simulation_variables.schemas.handles import SimulationHandles
from cosimulator.simulation_variables.schemas.results import SimulationTimestepResult

def get_simulation_timestamp(
        *,
        simulation_timestep_result: SimulationTimestepResult,
) -> datetime:
    simulation_timestamp = (
            datetime(
                year=simulation_timestep_result.year,
                month=simulation_timestep_result.month,
                day=simulation_timestep_result.day,
            )
            + timedelta(
                hours=simulation_timestep_result.hour,
                minutes=simulation_timestep_result.minute,
            )
    )

    return simulation_timestamp


def get_simulation_timestep_result(
        *,
        ep: EPlusAPIHelper,
        state: c_void_p,
        zone_names: set[str],
        simulation_handles: SimulationHandles,
        net_wall_area_by_zone: dict[str, float] | None = None,
        openable_window_geometry_by_zone: dict[str, dict[str, float]] | None = None,
) -> SimulationTimestepResult:

    # ``year()`` exposes the source year of each EPW weather record. Typical
    # meteorological year files combine records from several historical years,
    # so that value is not a monotonic simulation calendar. ``calendar_year``
    # is the correct year for a weather-file RunPeriod and produces stable,
    # comparable timestamps for MongoDB and CSV output.
    year = ep.exchange.calendar_year(state)
    month = ep.exchange.month(state)
    day = ep.exchange.day_of_month(state)
    hour = ep.exchange.hour(state)

    # Derive the end-of-zone-timestep minute from the fixed zone timestep
    # index. During a real run, ``minutes()`` can reflect an HVAC system
    # sub-timestep and was observed returning values above 60. Plant profiles
    # and persisted results must follow zone timesteps instead.
    zone_timesteps_per_hour = ep.exchange.num_time_steps_in_hour(state)
    zone_timestep_number = ep.exchange.zone_time_step_number(state)
    minute = round(
        zone_timestep_number * 60 / zone_timesteps_per_hour
    )

    zone_results = get_values_for_zone_output_variables(
        ep=ep,
        state=state,
        zone_names=zone_names,
        handle_variables_dict=simulation_handles.zone_handles,
    )
    populate_system_node_values(
        ep=ep,
        state=state,
        zone_results=zone_results,
        handle_variables_dict=simulation_handles.zone_handles,
    )

    simulation_timestep_result = SimulationTimestepResult(
        year=year,
        month=month,
        day=day,
        hour=hour,
        minute=minute,

        zone_internal_variable_values=get_zone_internal_variable_values(
            ep=ep,
            state=state,
            zone_names=zone_names,
            handle_variables_dict=simulation_handles.zone_internal_variable_handles,
            net_wall_area_by_zone=net_wall_area_by_zone,
            openable_window_geometry_by_zone=openable_window_geometry_by_zone,
        ),

        # Zone-specific results
        zone_results=zone_results,
    )

    environment_values = get_environment_output_variable_values(
        ep=ep,
        state=state,
        simulation_handles=simulation_handles,
    )
    for attribute_name, value in environment_values.items():
        setattr(simulation_timestep_result, attribute_name, value)

    return simulation_timestep_result
