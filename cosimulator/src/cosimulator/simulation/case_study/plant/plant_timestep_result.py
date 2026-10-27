"""Validated persistence result produced by the plant case study."""

from typing import ClassVar

from pydantic import BaseModel

from cosimulator.simulation.case_study.timestep_result import (
    CaseStudyTimestepResult,
)


class ZonePlantCO2ExchangeValue(BaseModel):
    """Plant physiological and thermal quantities stored for one zone/timestep."""

    zone_name: str
    green_wall_area_m2: float
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


class PlantTimestepResult(CaseStudyTimestepResult):
    """MongoDB contribution owned exclusively by the plant case study."""

    persistence_field_name: ClassVar[str] = "plant_co2_exchange_results"

    plant_co2_exchange_results: dict[str, ZonePlantCO2ExchangeValue]
