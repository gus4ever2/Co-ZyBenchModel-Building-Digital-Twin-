"""Energy calculations and final HVAC intensity values."""

from dataclasses import dataclass
from math import isfinite
from typing import Any

from cosimulator.analytics.contracts import AnalyticsInput, AnalyticsResult


def _number(value: Any) -> float | None:
    return float(value) if isinstance(value, (int, float)) and not isinstance(value, bool) and isfinite(value) else None


@dataclass(slots=True)
class EnergyData:
    hvac_kwh: float = 0.0
    heating_kwh: float = 0.0
    cooling_kwh: float = 0.0
    hvac_seen: bool = False
    heating_seen: bool = False
    cooling_seen: bool = False
    peak_hvac_kwh: float | None = None


class EnergyResult(AnalyticsResult):
    totalHvacKwh: float | None = None
    totalHeatingKwh: float | None = None
    totalCoolingKwh: float | None = None
    peakTimestepHvacKwh: float | None = None


def calculate_energy(input: AnalyticsInput, data: EnergyData) -> None:
    """Add this timestamp's EnergyPlus electricity meters to the state."""
    meters = input.results.get("meter_results") or {}
    for meter, total_field, seen_field in (("hvac", "hvac_kwh", "hvac_seen"), ("heating", "heating_kwh", "heating_seen"), ("cooling", "cooling_kwh", "cooling_seen")):
        joules = _number(meters.get(f"{meter}_electricity_j"))
        if joules is None:
            continue
        kwh = joules / 3_600_000
        setattr(data, total_field, getattr(data, total_field) + kwh)
        setattr(data, seen_field, True)
        if meter == "hvac":
            data.peak_hvac_kwh = kwh if data.peak_hvac_kwh is None else max(data.peak_hvac_kwh, kwh)


def create_energy_result(data: EnergyData) -> EnergyResult:
    return EnergyResult(totalHvacKwh=data.hvac_kwh if data.hvac_seen else None,
                        totalHeatingKwh=data.heating_kwh if data.heating_seen else None,
                        totalCoolingKwh=data.cooling_kwh if data.cooling_seen else None,
                        peakTimestepHvacKwh=data.peak_hvac_kwh)
