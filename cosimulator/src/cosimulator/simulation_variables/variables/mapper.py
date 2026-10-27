"""Map EnergyPlus Output:Variable names to typed simulation result fields."""

from .variables import OutputVariable, OutputVariableKeyType


def _keys_for_zones(*, zone_names: set[str], suffix: str) -> set[str]:
    """Build EnergyPlus keys such as ``Office People`` for each zone."""
    return {f"{zone_name} {suffix.strip()}" for zone_name in zone_names}


def find_variable_key_values(
    *,
    zone_names: set[str],
    air_loop_names: set[str] | None = None,
    key_type: OutputVariableKeyType,
    key_suffix: str = "People",
) -> set[str]:
    """Resolve the EnergyPlus keys needed by one output-variable definition."""
    if key_type is OutputVariableKeyType.ZONE:
        return zone_names
    if key_type is OutputVariableKeyType.PEOPLE:
        return _keys_for_zones(zone_names=zone_names, suffix=key_suffix)
    if key_type is OutputVariableKeyType.ENVIRONMENT:
        return {"Environment"}
    if key_type is OutputVariableKeyType.AIR_LOOP:
        return air_loop_names or set()
    return set()


# This mapper is the single source of EnergyPlus names and result fields.
OUTPUT_VARIABLE_MAPPING: dict[str, OutputVariable] = {
    "Zone Air Temperature": OutputVariable(result_field="zone_air_temp_c", is_zone_result=True, key_type=OutputVariableKeyType.ZONE),
    "Zone Mean Radiant Temperature": OutputVariable(result_field="mean_radiant_temperature_c", is_zone_result=True, key_type=OutputVariableKeyType.ZONE),
    "Zone Air CO2 Concentration": OutputVariable(result_field="co2_concentration_ppm", is_zone_result=True, key_type=OutputVariableKeyType.ZONE),
    "Zone Air CO2 Setpoint Concentration": OutputVariable(result_field="co2_setpoint_ppm", is_zone_result=True, key_type=OutputVariableKeyType.ZONE),
    "Zone Air CO2 Predicted Load to Setpoint Mass Flow Rate": OutputVariable(result_field="co2_predicted_load_kg_s", is_zone_result=True, key_type=OutputVariableKeyType.ZONE),
    "Zone Air Relative Humidity": OutputVariable(result_field="relative_humidity_percent", is_zone_result=True, key_type=OutputVariableKeyType.ZONE),
    "Zone Thermostat Cooling Setpoint Temperature": OutputVariable(result_field="cooling_setpoint_c", is_zone_result=True, key_type=OutputVariableKeyType.ZONE),
    "Zone Thermostat Heating Setpoint Temperature": OutputVariable(result_field="heating_setpoint_c", is_zone_result=True, key_type=OutputVariableKeyType.ZONE),
    "Zone Air Heat Balance Outdoor Air Transfer Rate": OutputVariable(result_field="outdoor_air_transfer_rate_w", is_zone_result=True, key_type=OutputVariableKeyType.ZONE),
    "Zone Air Heat Balance Air Energy Storage Rate": OutputVariable(result_field="air_energy_storage_rate_w", is_zone_result=True, key_type=OutputVariableKeyType.ZONE),
    "Zone People Occupant Count": OutputVariable(result_field="occupant_count", is_zone_result=True, key_type=OutputVariableKeyType.ZONE),
    "Zone People Total Heating Rate": OutputVariable(result_field="people_heat_gain_rate_w", is_zone_result=True, key_type=OutputVariableKeyType.ZONE),
    "Zone People Total Heating Energy": OutputVariable(result_field="people_heat_gain_energy_j", is_zone_result=True, key_type=OutputVariableKeyType.ZONE),
    "Site Outdoor Air Drybulb Temperature": OutputVariable(result_field="outdoor_air_temp_c", is_zone_result=False, key_type=OutputVariableKeyType.ENVIRONMENT),
    "Site Wind Speed": OutputVariable(result_field="wind_speed_m_s", is_zone_result=False, key_type=OutputVariableKeyType.ENVIRONMENT),
    "Air System Outdoor Air Flow Fraction": OutputVariable(result_field="outdoor_air_flow_fraction", is_zone_result=False, key_type=OutputVariableKeyType.AIR_LOOP),
    "Air System Outdoor Air Economizer Status": OutputVariable(result_field="economizer_status", is_zone_result=False, key_type=OutputVariableKeyType.AIR_LOOP),
}

# System-node values are aggregated per zone and therefore use a dedicated
# read path, but their EnergyPlus names still belong to the same mapper.
SYSTEM_NODE_OUTPUT_VARIABLES: dict[str, OutputVariable] = {
    "System Node Temperature": OutputVariable(result_field="temperature", is_zone_result=True, key_type=OutputVariableKeyType.SYSTEM_NODE),
    "System Node Mass Flow Rate": OutputVariable(result_field="mass_flow", is_zone_result=True, key_type=OutputVariableKeyType.SYSTEM_NODE),
    "System Node CO2 Concentration": OutputVariable(result_field="co2_concentration", is_zone_result=True, key_type=OutputVariableKeyType.SYSTEM_NODE),
}
