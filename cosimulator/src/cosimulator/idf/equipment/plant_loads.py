"""Prepare the actuated sensible and latent zone loads for plant simulations."""

import math

from cosimulator.idf.equipment.other_equipment_for_plants import add_other_equipment_for_plants
from cosimulator.idf.utils.upsert_named_idf_object import upsert_named_idf_object
from cosimulator.idf.utils.wall_area import calculate_green_wall_area_by_zone
from cosimulator.schemas.simulation_context import PlantSimulation

PREFIX = "CozyBench Hydroponic "  # Namespace shared by generated plant loads and runtime actuator lookup.
LIGHTS_ON_HOUR = 8  # Start of the fixed daily plant lighting period.
LIGHTS_OFF_HOUR = 22  # End of the fixed daily plant lighting period.


def _remove_generated_loads(idf) -> None:
    """Remove only equipment and schedules owned by this plant coupling."""
    for obj in list(idf.idfobjects["OTHEREQUIPMENT"]):
        if str(obj.Name).startswith(PREFIX):
            idf.removeidfobject(obj)
    suffixes = (" Plant Latent Load", " Plant Sensible Load")  # Only schedules belonging to generated plant loads are removed.
    for obj in list(idf.idfobjects["SCHEDULE:CONSTANT"]):
        if str(obj.Name).startswith(PREFIX) and str(obj.Name).endswith(suffixes):
            idf.removeidfobject(obj)


def _validate_profile(profile: dict) -> None:
    """The thermal coupling requires a valid schema-v5 grid and geometry."""
    if int(profile.get("schema_version", 0)) < 5:
        raise ValueError(
            "Plant response grid must be regenerated as schema version 5 "
            "before it can drive PhotosynEB thermal loads"
        )
    leaf_area = float(profile.get("total_leaf_area_m2", 0))  # Leaf area encoded in the response grid, in square metres.
    panel_area = float(profile.get("panel_area_m2", 1.0))  # Reference panel area used when scaling grid results, in square metres.
    if not (math.isfinite(leaf_area) and leaf_area > 0
            and math.isfinite(panel_area) and panel_area > 0):
        raise ValueError("PhotosynEB zone loads require valid leaf and reference-panel areas")


def add_indoor_living_walls(*, idf, zone_names: set[str], settings: PlantSimulation, profile: dict):
    """Add the two plant loads in each zone with available wall area."""
    areas = calculate_green_wall_area_by_zone(
        idf=idf, green_wall_size=settings.green_wall_size,
        idf_zone_names=zone_names, coverage_percentage=settings.coverage_percentage,
    )
    eligible_zones = {zone for zone, area in areas.items() if area > 0}  # Only zones with a positive green-wall area receive equipment.
    _remove_generated_loads(idf)  # Remove previous generated loads so repeated configuration stays idempotent.
    if not eligible_zones:
        return idf

    _validate_profile(profile)  # Reject outdated or invalid grids before creating the zone loads.
    upsert_named_idf_object(idf, "SCHEDULE:CONSTANT", PREFIX + "Availability", Hourly_Value=1)
    add_other_equipment_for_plants(idf=idf, zone_names=eligible_zones, prefix=PREFIX)  # Create one latent and one sensible load for each eligible zone.
    return idf
