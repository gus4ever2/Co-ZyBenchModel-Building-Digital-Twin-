from dataclasses import dataclass, field

from cosimulator.simulation_variables.internal_variables.values import (
    ZoneInternalVariableHandles,
)
from cosimulator.simulation_variables.meters.meters import MeterHandles


@dataclass(slots=True, kw_only=True)
class ZoneHandles:
    zone_name: str = ""
    zone_air_temp_c: int = -1
    mean_radiant_temperature_c: int = -1
    co2_concentration_ppm: int = -1
    co2_setpoint_ppm: int = -1
    co2_predicted_load_kg_s: int = -1
    relative_humidity_percent: int = -1
    humidity_ratio_kg_water_per_kg_dry_air: int = -1
    cooling_setpoint_c: int = -1
    heating_setpoint_c: int = -1
    occupant_count: int = -1
    people_heat_gain_rate_w: int = -1
    people_heat_gain_energy_j: int = -1
    outdoor_air_transfer_rate_w: int = -1
    air_energy_storage_rate_w: int = -1
    supply_air_temp_c: list[int] = field(default_factory=list)
    supply_air_mass_flow_kg_s: list[int] = field(default_factory=list)
    supply_air_co2_ppm: list[int] = field(default_factory=list)
    return_air_mass_flow_kg_s: list[int] = field(default_factory=list)
    return_air_co2_ppm: list[int] = field(default_factory=list)


@dataclass(slots=True, kw_only=True)
class SimulationHandles:
    outdoor_air_temp_c: int = -1
    wind_speed_m_s: int = -1
    outdoor_air_flow_fraction: int = -1
    economizer_status: int = -1
    zone_handles: dict[str, ZoneHandles] = field(default_factory=dict)
    zone_internal_variable_handles: dict[
        str,
        ZoneInternalVariableHandles,
    ] = field(default_factory=dict)
    meter_handles: MeterHandles | None = None
