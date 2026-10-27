from dataclasses import dataclass


@dataclass(slots=True, frozen=True, kw_only=True)
class ZonePlantActuatorHandles:
    """EnergyPlus schedule actuators used for one plant-enabled zone."""

    zone_name: str  # Thermal zone owning all four plant schedules.
    sink_schedule_name: str
    sink_handle: int
    source_schedule_name: str
    source_handle: int
    latent_load_schedule_name: str
    latent_load_handle: int
    sensible_load_schedule_name: str
    sensible_load_handle: int


@dataclass(slots=True, frozen=True, kw_only=True)
class ZonePlantCO2ExchangeResult:
    """Green-wall physiological response applied to a zone during one timestep."""

    zone_name: str
    green_wall_area_m2: float  # Installed wall area, not total leaf area.
    net_co2_exchange_g_per_hour: float
    sink_volume_flow_rate_m3_s: float
    source_volume_flow_rate_m3_s: float
    ppfd_umol_m2_s: float
    transpiration_kg_per_hour: float = 0.0
    evapotranspiration_rate_kg_m2_s: float = 0.0
    leaf_temperature_c: float | None = None
    stomatal_conductance_mol_m2_s: float | None = None
    energy_balance_failed_leaf_fraction: float | None = None
    latent_heat_gain_w: float = 0.0
    sensible_heat_gain_w: float = 0.0
    incident_shortwave_gain_w: float = 0.0
    net_radiation_gain_w: float = 0.0
    longwave_emission_w: float = 0.0
