from __future__ import annotations

from dataclasses import dataclass, field
from typing import TYPE_CHECKING

from cosimulator.simulation_variables.internal_variables.values import (
    ZoneInternalVariableValues,
)
from cosimulator.simulation_variables.meters.meters import MeterValues
from cosimulator.simulation.case_study.open_windows.window_control_models import (
    ZoneWindowOpeningResult,
)

if TYPE_CHECKING:
    from cosimulator.simulation.case_study.plant.plant_control_models import (
        ZonePlantCO2ExchangeResult,
    )


@dataclass(slots=True, kw_only=True)
class ZoneResult:
    zone_name: str = ""
    zone_air_temp_c: float = 0.0
    mean_radiant_temperature_c: float = 0.0
    co2_concentration_ppm: float = 0.0
    co2_setpoint_ppm: float = 0.0
    co2_predicted_load_kg_s: float = 0.0
    relative_humidity_percent: float = 0.0
    cooling_setpoint_c: float = 0.0
    heating_setpoint_c: float = 0.0
    occupant_count: float = 0.0
    people_heat_gain_rate_w: float = 0.0
    people_heat_gain_energy_j: float = 0.0
    outdoor_air_transfer_rate_w: float = 0.0
    outdoor_air_transfer_energy_j: float = 0.0
    air_energy_storage_rate_w: float = 0.0
    supply_air_temp_c: float | None = None
    supply_air_mass_flow_kg_s: float | None = None
    supply_air_co2_ppm: float | None = None
    supply_co2_mass_flow_g_s: float | None = None
    return_air_mass_flow_kg_s: float | None = None
    return_air_co2_ppm: float | None = None
    return_co2_mass_flow_g_s: float | None = None


@dataclass(slots=True, kw_only=True)
class SimulationTimestepResult:
    year: int
    month: int
    day: int
    hour: int
    minute: int
    outdoor_air_temp_c: float = 1.0
    wind_speed_m_s: float = 1.0
    outdoor_air_flow_fraction: float | None = None
    economizer_status: float | None = None
    zone_results: dict[str, ZoneResult] = field(default_factory=dict)
    zone_internal_variable_values: dict[
        str,
        ZoneInternalVariableValues,
    ] = field(default_factory=dict)
    meter_results: MeterValues | None = None
    window_opening_results: dict[
        str,
        ZoneWindowOpeningResult,
    ] = field(default_factory=dict)
    plant_co2_exchange_results: dict[
        str,
        ZonePlantCO2ExchangeResult,
    ] = field(default_factory=dict)


