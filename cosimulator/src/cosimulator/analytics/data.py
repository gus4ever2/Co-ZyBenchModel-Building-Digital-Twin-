"""Conversion from a MongoDB timestep document to the analytics input model."""

from datetime import datetime, timezone
from typing import Any, Iterable, Iterator, Mapping
from copy import deepcopy

from cosimulator.analytics.contracts import AnalyticsInput


def parse_timestamp(value: Any) -> datetime | None:
    """Return a UTC datetime, or ``None`` when the stored value is invalid."""
    try:
        parsed = value if isinstance(value, datetime) else datetime.fromisoformat(
            str(value).replace("Z", "+00:00")
        )
        return (
            parsed.replace(tzinfo=timezone.utc)
            if parsed.tzinfo is None
            else parsed.astimezone(timezone.utc)
        )
    except (TypeError, ValueError):
        return None


def analytics_input(document: Mapping[str, Any], simulation_id: str) -> AnalyticsInput:
    """Keep the shared envelope typed and the simulation-specific data open."""
    raw_results = document.get("results")
    timestep_number = document.get("timestep_number")
    return AnalyticsInput(
        simulation_id=simulation_id,
        timestamp=parse_timestamp(document.get("simulation_timestamp")),
        timestep_number=timestep_number if isinstance(timestep_number, int) else None,
        results=dict(raw_results) if isinstance(raw_results, Mapping) else {},
    )


def iter_inputs(
    documents: Iterable[Mapping[str, Any]], simulation_id: str
) -> Iterator[AnalyticsInput]:
    """Read a Mongo cursor lazily without building a second full copy in RAM."""
    for document in documents:
        yield analytics_input(document, simulation_id)


def enrich(document: dict[str, Any]) -> dict[str, Any]:
    """Add small presentation values to one response document without mutation."""
    enriched_document = deepcopy(document)
    results = enriched_document.get("results") or {}
    meters = results.get("meter_results") or {}
    for name in ("hvac", "heating", "cooling"):
        value = meters.get(f"{name}_electricity_j")
        meters[f"{name}_electricity_kwh"] = value / 3_600_000 if isinstance(value, (int, float)) else None
    results["meter_results"] = meters
    for zone in (results.get("zone_results") or {}).values():
        air, radiant = zone.get("zone_air_temp_c"), zone.get("mean_radiant_temperature_c")
        zone["operative_temperature_c"] = (air + radiant) / 2 if isinstance(air, (int, float)) and isinstance(radiant, (int, float)) else None
    enriched_document["results"] = results
    return enriched_document


def enrich_documents(documents: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    """Enrich a response list while preserving MongoDB documents unchanged."""
    return [enrich(document) for document in documents]
