"""Calendar-period energy totals and plotted values from the same timestep pass."""

from dataclasses import dataclass, field
from datetime import timedelta
from math import isfinite

from pydantic import Field

from cosimulator.analytics.contracts import AnalyticsInput, AnalyticsResult
from cosimulator.analytics.calculations.energy import EnergyData, calculate_energy, create_energy_result

PERIODS = {
    "maySeptember": ("May–September", [5, 6, 7, 8, 9]),
    "octoberApril": ("October–April", [10, 11, 12, 1, 2, 3, 4]),
}


@dataclass(slots=True)
class SeasonalEnergyData:
    totals: dict[str, EnergyData] = field(default_factory=lambda: {key: EnergyData() for key in PERIODS})
    series: dict[str, list[dict]] = field(default_factory=lambda: {key: [] for key in PERIODS})
    previous_period: str | None = None
    samples: dict[str, int] = field(default_factory=lambda: {key: 0 for key in PERIODS})


class SeasonalEnergyResult(AnalyticsResult):
    periods: dict[str, dict] = Field(default_factory=dict)


def calculate_seasonal_energy(input: AnalyticsInput, data: SeasonalEnergyData) -> None:
    if input.timestamp is None:
        return
    # Timestamps mark interval ends: May 1 00:00 belongs to April 30's final
    # interval, and October 1 00:00 belongs to September 30's final interval.
    month = (input.timestamp - timedelta(microseconds=1)).month
    period = "maySeptember" if 5 <= month <= 9 else "octoberApril"
    timestamp = input.timestamp.isoformat().replace("+00:00", "Z")
    meters = input.results.get("meter_results") or {}
    point = {"timestamp": timestamp}
    for key in ("heating", "cooling", "hvac"):
        value = meters.get(key + "_electricity_j")
        valid = isinstance(value, (int, float)) and not isinstance(value, bool) and isfinite(value)
        point[key + "Kwh"] = float(value) / 3_600_000 if valid else None
    if data.previous_period is not None and data.previous_period != period:
        # Break the October–April line across the excluded May–September gap.
        data.series[data.previous_period].append({
            "timestamp": timestamp, "heatingKwh": None, "coolingKwh": None, "hvacKwh": None,
        })
    calculate_energy(input, data.totals[period])
    data.series[period].append(point)
    data.samples[period] += 1
    data.previous_period = period


def create_seasonal_energy_result(data: SeasonalEnergyData) -> SeasonalEnergyResult:
    return SeasonalEnergyResult(periods={
        key: {
            "label": label,
            "months": months,
            "timestepCount": data.samples[key],
            "metrics": create_energy_result(data.totals[key]).model_dump(),
            "series": data.series[key],
        }
        for key, (label, months) in PERIODS.items()
    })
