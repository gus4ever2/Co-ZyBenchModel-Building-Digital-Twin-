from ctypes import c_void_p
from datetime import datetime
import math

from energyplus_api_helpers.import_helper import EPlusAPIHelper

from cosimulator.simulation_variables.schemas.results import SimulationTimestepResult
from cosimulator.simulation.case_study.plant.plant_control_models import (
    ZonePlantActuatorHandles,
    ZonePlantCO2ExchangeResult,
)
from cosimulator.simulation.case_study.plant.plant_profile_lookup import PlantProfileLookup
from cosimulator.schemas.simulation_context import (
    PlantCO2ExchangeMode,
    PlantSimulation,
)


# The profile uses mass flow (g/h), while EnergyPlus expects pure-CO2 volume
# flow (m3/s). This density is an appropriate engineering approximation for
# the intended indoor conditions and keeps the conversion explicit/testable.
_CO2_DENSITY_KG_M3 = 1.842  # Conversion between CO2 mass and pure-gas volume.
from cosimulator.idf.living_wall.schedules import LIGHTS_ON_HOUR, LIGHTS_OFF_HOUR
# Below this indoor boundary the green-wall uptake is not applied.
_MINIMUM_ZONE_CO2_PPM = 300.0  # Lower physical concentration boundary.


def _grams_per_hour_to_cubic_metres_per_second(value: float) -> float:
    """Convert the profile's CO2 mass rate to an EnergyPlus volume flow."""
    return (value / 1000.0) / _CO2_DENSITY_KG_M3 / 3600.0


def _maximum_sink_flow_m3_s(
    *,
    co2_concentration_ppm: float,
    air_volume_m3: float,
    zone_timestep_hours: float,
) -> float:
    """Limit removal to the CO2 physically available above the 300 ppm floor."""
    if (
        not all(
            math.isfinite(value)
            for value in (co2_concentration_ppm, air_volume_m3, zone_timestep_hours)
        )
        or co2_concentration_ppm <= _MINIMUM_ZONE_CO2_PPM
        or air_volume_m3 <= 0.0
        or zone_timestep_hours <= 0.0
    ):
        return 0.0
    # Only the volume above the floor may be removed in this timestep.
    removable_co2_volume_m3 = (
        air_volume_m3
        * (co2_concentration_ppm - _MINIMUM_ZONE_CO2_PPM)
        * 1.0e-6
    )
    return removable_co2_volume_m3 / (zone_timestep_hours * 3600.0)


def _effective_ppfd(*, timestamp: datetime, settings: PlantSimulation) -> float:
    """Use the selected preset from 08:00 inclusive until 22:00 exclusive."""
    decimal_hour = timestamp.hour + timestamp.minute / 60.0
    if LIGHTS_ON_HOUR <= decimal_hour < LIGHTS_OFF_HOUR:
        return settings.lighting_level.ppfd_umol_m2_s
    return 0.0


def apply_plant_control(
    *,
    ep: EPlusAPIHelper,
    state: c_void_p,
    timestamp: datetime,
    timestep_result: SimulationTimestepResult,
    actuator_handles_by_zone: dict[str, ZonePlantActuatorHandles],
    profile_lookup: PlantProfileLookup,
    settings: PlantSimulation,
    green_wall_area_by_zone: dict[str, float],
) -> dict[str, ZonePlantCO2ExchangeResult]:
    """Apply Photosyn CO2 sink/source flow; EnergyPlus models wall heat/moisture.

    Green-wall areas are fixed before EnergyPlus starts. Legacy grids may
    contain thermal diagnostics, but CO2-only grids intentionally omit them.
    """
    if not actuator_handles_by_zone:
        return {}

    results: dict[str, ZonePlantCO2ExchangeResult] = {}  # One result per zone.
    effective_ppfd = _effective_ppfd(timestamp=timestamp, settings=settings)
    zone_timestep_hours = ep.exchange.zone_time_step(state)  # E+ duration.

    for zone_name, handles in actuator_handles_by_zone.items():
        zone_result = timestep_result.zone_results.get(zone_name)
        if zone_result is None:
            continue
        if zone_result.co2_concentration_ppm <= _MINIMUM_ZONE_CO2_PPM:
            # Do not evaluate a positive uptake below the physical CO2 floor.
            response = None
            per_square_metre_exchange_g_h = 0.0
        else:
            response = profile_lookup.get_response(
                air_temperature_c=zone_result.zone_air_temp_c,
                relative_humidity_percent=zone_result.relative_humidity_percent,
                co2_concentration_ppm=zone_result.co2_concentration_ppm,
                ppfd_umol_m2_s=effective_ppfd,
            )
            per_square_metre_exchange_g_h = response.net_co2_exchange_g_per_hour
        # Scale a 1 m² reference-panel response to the user's installed area.
        green_wall_area_m2 = green_wall_area_by_zone.get(zone_name, 0.0)
        panel_multiplier = (
            green_wall_area_m2 / response.reference_panel_area_m2
            if response is not None
            else 0.0
        )
        total_leaf_area_m2 = (
            response.total_leaf_area_m2 * panel_multiplier
            if response is not None
            else 0.0
        )
        total_exchange_g_h = per_square_metre_exchange_g_h * panel_multiplier
        total_transpiration_kg_h = (
            response.transpiration_kg_per_hour * panel_multiplier
            if response is not None
            else 0.0
        )
        latent_heat_gain_w = (
            response.latent_heat_flux_w_m2_leaf * total_leaf_area_m2
            if response is not None and response.has_thermal_flux_data
            else 0.0
        )
        sensible_heat_gain_w = (
            response.sensible_heat_flux_w_m2_leaf * total_leaf_area_m2
            if response is not None and response.has_thermal_flux_data
            else 0.0
        )
        incident_shortwave_gain_w = (
            response.incident_shortwave_flux_w_m2_leaf * total_leaf_area_m2
            if response is not None and response.has_thermal_flux_data
            else 0.0
        )
        net_radiation_gain_w = (
            response.net_radiation_flux_w_m2_leaf * total_leaf_area_m2
            if response is not None and response.has_thermal_flux_data
            else 0.0
        )
        longwave_emission_w = (
            response.longwave_emission_flux_w_m2_leaf * total_leaf_area_m2
            if response is not None and response.has_thermal_flux_data
            else 0.0
        )
        # This normalized rate is useful for reporting, unlike the total load.
        evapotranspiration_rate_kg_m2_s = (
            total_transpiration_kg_h / green_wall_area_m2 / 3600.0
            if green_wall_area_m2 > 0.0
            else 0.0
        )

        # Positive profile values drive only the sink; negative values (net
        # respiration) drive only the source, preventing double counting.
        # In the uptake-only scenario the raw physiological result remains
        # visible, but its source flow is deliberately not applied to the zone.
        requested_sink_flow_m3_s = _grams_per_hour_to_cubic_metres_per_second(
            max(total_exchange_g_h, 0.0)
        )
        # The volume limits uptake to CO2 physically present in the zone air.
        zone_geometry = timestep_result.zone_internal_variable_values.get(zone_name)
        sink_flow_m3_s = min(
            requested_sink_flow_m3_s,
            _maximum_sink_flow_m3_s(
                co2_concentration_ppm=zone_result.co2_concentration_ppm,
                air_volume_m3=(zone_geometry.air_volume_m3 if zone_geometry else 0.0),
                zone_timestep_hours=zone_timestep_hours,
            ),
        )
        source_flow_m3_s = (
            _grams_per_hour_to_cubic_metres_per_second(
                max(-total_exchange_g_h, 0.0)
            )
            if settings.exchange_mode is PlantCO2ExchangeMode.FULL_EXCHANGE
            else 0.0
        )
        ep.exchange.set_actuator_value(state, handles.sink_handle, sink_flow_m3_s)
        ep.exchange.set_actuator_value(
            state,
            handles.source_handle,
            source_flow_m3_s,
        )
        results[zone_name] = ZonePlantCO2ExchangeResult(
            zone_name=zone_name,
            green_wall_area_m2=green_wall_area_m2,
            total_leaf_area_m2=total_leaf_area_m2,
            net_co2_exchange_g_per_hour=total_exchange_g_h,
            sink_volume_flow_rate_m3_s=sink_flow_m3_s,
            source_volume_flow_rate_m3_s=source_flow_m3_s,
            ppfd_umol_m2_s=effective_ppfd,
            transpiration_kg_per_hour=total_transpiration_kg_h,
            evapotranspiration_rate_kg_m2_s=evapotranspiration_rate_kg_m2_s,
            leaf_temperature_c=(response.leaf_temperature_c if response else None),
            stomatal_conductance_mol_m2_s=(
                response.stomatal_conductance_mol_m2_s if response else None
            ),
            energy_balance_failed_leaf_fraction=(
                response.energy_balance_failed_leaf_fraction if response else None
            ),
            latent_heat_gain_w=latent_heat_gain_w,
            sensible_heat_gain_w=sensible_heat_gain_w,
            incident_shortwave_gain_w=incident_shortwave_gain_w,
            net_radiation_gain_w=net_radiation_gain_w,
            longwave_emission_w=longwave_emission_w,
        )
    return results
