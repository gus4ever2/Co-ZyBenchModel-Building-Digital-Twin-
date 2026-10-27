from cosimulator.core.logger.logging import logger
from cosimulator.simulation_variables.variables.mapper import (
    OUTPUT_VARIABLE_MAPPING,
    SYSTEM_NODE_OUTPUT_VARIABLES,
)
from cosimulator.simulation_variables.variables.variables import OutputVariableKeyType
from cosimulator.simulation_variables.schemas.handles import (
    SimulationHandles,
    ZoneHandles,
)
from cosimulator.simulation_variables.schemas.results import ZoneResult
from ctypes import c_void_p
from energyplus_api_helpers.import_helper import EPlusAPIHelper

CO2_MASS_RATIO_TO_DRY_AIR = 44.01 / 28.97

def _get_output_variable_value(
        *,
        ep: EPlusAPIHelper,
        state: c_void_p,
        handle: int,
        variable_name: str,
        zone_name: str | None = None,
) -> float:

    if handle == -1:
        logger.warning(
            f"Invalid output variable handle: "
            f"variable_name='{variable_name}', "
            f"zone_name='{zone_name}'"
        )
        return 0.0

    try:
        return ep.exchange.get_variable_value(
            state=state,
            variable_handle=handle,
        )

    except Exception as e:
        logger.error(
            f"Failed to get output variable value: "
            f"variable_name='{variable_name}', "
            f"zone_name='{zone_name}', "
            f"handle={handle}, "
            f"error='{e}'"
        )
        return 0.0


def get_values_for_zone_output_variables(
        *,
        ep: EPlusAPIHelper,
        state: c_void_p,
        zone_names: set[str],
        handle_variables_dict: dict[str, ZoneHandles],
) -> dict[str, ZoneResult]:

    zone_results: dict[str, ZoneResult] = {}

    zone_timestep_hours = ep.exchange.zone_time_step(state)
    zone_timestep_seconds = zone_timestep_hours * 3600.0

    for zone_name in zone_names:

        zone_handles = handle_variables_dict.get(zone_name)

        zone_result = ZoneResult(
            zone_name=zone_name,
        )

        if zone_handles is None:
            logger.warning(
                f"No ZoneHandles found for zone_name='{zone_name}'"
            )
            zone_results[zone_name] = zone_result
            continue

        for output_variable_name, variable_meta_data in OUTPUT_VARIABLE_MAPPING.items():

            if not variable_meta_data.is_zone_result:
                continue

            attribute_name = variable_meta_data.result_field

            handle = getattr(
                zone_handles,
                attribute_name,
                -1,
            )

            value = _get_output_variable_value(
                ep=ep,
                state=state,
                handle=handle,
                variable_name=output_variable_name,
                zone_name=zone_name,
            )

            setattr(
                zone_result,
                attribute_name,
                value,
            )

        zone_result.outdoor_air_transfer_energy_j = (
            zone_result.outdoor_air_transfer_rate_w * zone_timestep_seconds
        )

        zone_results[zone_name] = zone_result

    return zone_results


def populate_system_node_values(
        *,
        ep: EPlusAPIHelper,
        state: c_void_p,
        zone_results: dict[str, ZoneResult],
        handle_variables_dict: dict[str, ZoneHandles],
) -> None:
    """Populate zone supply/return values from native System Node outputs."""
    for zone_name, zone_result in zone_results.items():
        handles = handle_variables_dict.get(zone_name)
        if handles is None:
            continue

        supply_mass = _sum_handles(ep=ep, state=state, handles=handles.supply_air_mass_flow_kg_s)
        supply_co2 = _weighted_average(
            ep=ep, state=state, value_handles=handles.supply_air_co2_ppm,
            mass_handles=handles.supply_air_mass_flow_kg_s,
            value_field="co2_concentration",
        )
        supply_temp = _weighted_average(
            ep=ep, state=state, value_handles=handles.supply_air_temp_c,
            mass_handles=handles.supply_air_mass_flow_kg_s,
            value_field="temperature",
        )
        return_mass = _sum_handles(ep=ep, state=state, handles=handles.return_air_mass_flow_kg_s)
        return_co2 = _weighted_average(
            ep=ep, state=state, value_handles=handles.return_air_co2_ppm,
            mass_handles=handles.return_air_mass_flow_kg_s,
            value_field="co2_concentration",
        )

        zone_result.supply_air_mass_flow_kg_s = supply_mass
        zone_result.supply_air_co2_ppm = supply_co2
        zone_result.supply_air_temp_c = supply_temp
        zone_result.supply_co2_mass_flow_g_s = _co2_mass_flow(supply_mass, supply_co2)
        zone_result.return_air_mass_flow_kg_s = return_mass
        zone_result.return_air_co2_ppm = return_co2
        zone_result.return_co2_mass_flow_g_s = _co2_mass_flow(return_mass, return_co2)


def _sum_handles(*, ep: EPlusAPIHelper, state: c_void_p, handles: list[int]) -> float | None:
    if not handles:
        return None
    return sum(
        _get_output_variable_value(ep=ep, state=state, handle=handle, variable_name=_system_node_variable_name("mass_flow"))
        for handle in handles
    )


def _weighted_average(
        *, ep: EPlusAPIHelper, state: c_void_p, value_handles: list[int], mass_handles: list[int], value_field: str
) -> float | None:
    if not value_handles or len(value_handles) != len(mass_handles):
        return None
    pairs = [
        (
            _get_output_variable_value(ep=ep, state=state, handle=value, variable_name=_system_node_variable_name(value_field)),
            _get_output_variable_value(ep=ep, state=state, handle=mass, variable_name=_system_node_variable_name("mass_flow")),
        )
        for value, mass in zip(value_handles, mass_handles, strict=True)
    ]
    total_mass = sum(mass for _, mass in pairs)
    if total_mass <= 0:
        return None
    return sum(value * mass for value, mass in pairs) / total_mass


def _co2_mass_flow(mass_flow_kg_s: float | None, co2_ppm: float | None) -> float | None:
    if mass_flow_kg_s is None or co2_ppm is None:
        return None
    return mass_flow_kg_s * co2_ppm * 1e-6 * CO2_MASS_RATIO_TO_DRY_AIR * 1000.0


def _system_node_variable_name(result_field: str) -> str:
    """Return the EnergyPlus name for a system-node aggregate calculation."""
    return next(
        name
        for name, definition in SYSTEM_NODE_OUTPUT_VARIABLES.items()
        if definition.result_field == result_field
    )


def get_environment_output_variable_values(
        *,
        ep: EPlusAPIHelper,
        state: c_void_p,
        simulation_handles: SimulationHandles,
) -> dict[str, float]:
    values: dict[str, float] = {}

    for output_variable_name, variable_meta_data in OUTPUT_VARIABLE_MAPPING.items():
        if variable_meta_data.is_zone_result:
            continue

        attribute_name = variable_meta_data.result_field
        handle = getattr(simulation_handles, attribute_name, -1)
        # Older result documents do not have this field. Likewise, an IDF can
        # lack an applicable AirLoop output. Preserve that distinction from a
        # real zero outdoor-air fraction so clients can render "—".
        if (
            variable_meta_data.key_type is OutputVariableKeyType.AIR_LOOP
            and handle == -1
        ):
            continue
        values[attribute_name] = _get_output_variable_value(
            ep=ep,
            state=state,
            handle=handle,
            variable_name=output_variable_name,
        )

    return values
