"""Green-wall area and plant-attributed CO2 concentration analytics."""

from dataclasses import dataclass, field
from datetime import datetime
from math import isfinite
from typing import Any

from pydantic import Field
from cosimulator.analytics.contracts import AnalyticsInput, AnalyticsResult

_CO2_MOLAR_MASS_G_PER_MOL = 44.01
_STANDARD_PRESSURE_PA = 101_325.0
_GAS_CONSTANT_J_PER_MOL_K = 8.314462618


def _number(value: Any) -> float | None:
    return float(value) if isinstance(value, (int, float)) and not isinstance(value, bool) and isfinite(value) else None


@dataclass(slots=True)
class GreenWallData:
    total_area: float = 0.0
    sample_count: int = 0
    area_by_zone: dict[str, list[float]] = field(default_factory=dict)
    leaf_area_by_zone: dict[str, list[float]] = field(default_factory=dict)
    co2_removed_lights_on_ppm_by_zone: dict[str, list[float]] = field(default_factory=dict)
    co2_added_lights_on_ppm_by_zone: dict[str, list[float]] = field(default_factory=dict)
    co2_removed_lights_off_ppm_by_zone: dict[str, list[float]] = field(default_factory=dict)
    co2_added_lights_off_ppm_by_zone: dict[str, list[float]] = field(default_factory=dict)
    previous_timestamp: datetime | None = None
    previous_timestep_number: int | None = None


class GreenWallResult(AnalyticsResult):
    averageGreenWallAreaM2: float | None = None
    totalLeafAreaM2: float | None = None
    byZone: dict[str, float | None] = Field(default_factory=dict)
    totalLeafAreaByZone: dict[str, float | None] = Field(default_factory=dict)
    meanCo2RemovedLightsOnPpmByZone: dict[str, float | None] = Field(default_factory=dict)
    meanCo2AddedLightsOnPpmByZone: dict[str, float | None] = Field(default_factory=dict)
    meanCo2RemovedLightsOffPpmByZone: dict[str, float | None] = Field(default_factory=dict)
    meanCo2AddedLightsOffPpmByZone: dict[str, float | None] = Field(default_factory=dict)


def calculate_green_wall(input: AnalyticsInput, data: GreenWallData) -> None:
    """Calculate plant-equivalent zone CO2 ppm changes for each timestep."""
    plant_results = input.results.get("plant_co2_exchange_results") or {}
    # Older timestep documents were saved with the persistence field nested
    # twice. Accept that shape while new writes use the flat zone map.
    nested_results = plant_results.get("plant_co2_exchange_results")
    if isinstance(nested_results, dict):
        plant_results = nested_results

    timestep_hours: float | None = None
    if input.timestamp is not None and data.previous_timestamp is not None:
        elapsed = (input.timestamp - data.previous_timestamp).total_seconds() / 3600
        consecutive = (
            input.timestep_number is None
            or data.previous_timestep_number is None
            or input.timestep_number == data.previous_timestep_number + 1
        )
        if consecutive and 0 < elapsed <= 24:
            timestep_hours = elapsed

    zone_exchange: dict[str, tuple[float, float]] = {}
    for plant_key, values in plant_results.items():
        zone_name = values.get("zone_name") or plant_key
        area = _number(values.get("green_wall_area_m2"))
        if area is not None:
            data.total_area += area
            data.sample_count += 1
            data.area_by_zone.setdefault(zone_name, []).append(area)
            leaf_area = _number(values.get("total_leaf_area_m2"))
            if leaf_area is not None:
                data.leaf_area_by_zone.setdefault(zone_name, []).append(leaf_area)

        exchange = _number(values.get("net_co2_exchange_g_per_hour"))
        ppfd = _number(values.get("ppfd_umol_m2_s"))
        if exchange is not None and ppfd is not None:
            total_exchange, max_ppfd = zone_exchange.get(zone_name, (0.0, 0.0))
            zone_exchange[zone_name] = (total_exchange + exchange, max(max_ppfd, ppfd))

    if timestep_hours is not None and input.timestamp is not None and input.timestamp.weekday() < 5:
        zone_results = input.results.get("zone_results") or {}
        geometry = input.results.get("zone_internal_variable_values") or {}
        for zone_name, (exchange_g_per_hour, ppfd) in zone_exchange.items():
            zone = zone_results.get(zone_name) or {}
            volume = _number((geometry.get(zone_name) or {}).get("air_volume_m3"))
            temperature = _number(zone.get("zone_air_temp_c"))
            if volume is None or volume <= 0 or temperature is None:
                continue

            mass_g = abs(exchange_g_per_hour) * timestep_hours
            temperature_k = temperature + 273.15
            air_moles = (
                _STANDARD_PRESSURE_PA * volume
                / (_GAS_CONSTANT_J_PER_MOL_K * temperature_k)
            )
            ppm_change = (mass_g / _CO2_MOLAR_MASS_G_PER_MOL) / air_moles * 1_000_000
            lights_on = ppfd > 0
            if exchange_g_per_hour >= 0:
                destination = (
                    data.co2_removed_lights_on_ppm_by_zone
                    if lights_on
                    else data.co2_removed_lights_off_ppm_by_zone
                )
                opposite = (
                    data.co2_added_lights_on_ppm_by_zone
                    if lights_on
                    else data.co2_added_lights_off_ppm_by_zone
                )
            else:
                destination = (
                    data.co2_added_lights_on_ppm_by_zone
                    if lights_on
                    else data.co2_added_lights_off_ppm_by_zone
                )
                opposite = (
                    data.co2_removed_lights_on_ppm_by_zone
                    if lights_on
                    else data.co2_removed_lights_off_ppm_by_zone
                )
            destination.setdefault(zone_name, []).append(ppm_change)
            opposite.setdefault(zone_name, []).append(0.0)

    if input.timestamp is not None:
        data.previous_timestamp = input.timestamp
        data.previous_timestep_number = input.timestep_number


def create_green_wall_result(data: GreenWallData) -> GreenWallResult:
    mean_leaf_area_by_zone = {
        name: sum(values) / len(values)
        for name, values in data.leaf_area_by_zone.items()
        if values
    }
    return GreenWallResult(
        averageGreenWallAreaM2=(
            data.total_area / data.sample_count if data.sample_count else None
        ),
        byZone={
            name: sum(values) / len(values)
            for name, values in data.area_by_zone.items()
        },
        totalLeafAreaByZone=mean_leaf_area_by_zone,
        totalLeafAreaM2=sum(mean_leaf_area_by_zone.values()) or None,
        meanCo2RemovedLightsOnPpmByZone=_means(data.co2_removed_lights_on_ppm_by_zone),
        meanCo2AddedLightsOnPpmByZone=_means(data.co2_added_lights_on_ppm_by_zone),
        meanCo2RemovedLightsOffPpmByZone=_means(data.co2_removed_lights_off_ppm_by_zone),
        meanCo2AddedLightsOffPpmByZone=_means(data.co2_added_lights_off_ppm_by_zone),
    )


def _means(values_by_zone: dict[str, list[float]]) -> dict[str, float]:
    return {
        name: sum(values) / len(values)
        for name, values in values_by_zone.items()
        if values
    }
