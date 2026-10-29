"""Calculate installed living-wall area from each zone's net wall area."""
from eppy.modeleditor import IDF

from cosimulator.idf.utils.wall_area import available_wall_area_by_zone
from cosimulator.schemas.simulation_context import GreenWallSize


def calculate_green_wall_area_by_zone(
    *,
    idf: IDF,
    green_wall_size: GreenWallSize,
    idf_zone_names: set[str],
    coverage_percentage: float | None = None,
) -> dict[str, float]:
    """Apply one coverage preset to each zone's own net wall area."""
    available_area = available_wall_area_by_zone(idf=idf)  # Net available wall area per zone after subtracting openings.
    if coverage_percentage is not None and not 0 <= coverage_percentage <= 100:
        raise ValueError("Coverage percentage must be between 0 and 100")
    coverage_ratio = green_wall_size.coverage_ratio if coverage_percentage is None else coverage_percentage / 100  # Use explicit user coverage when present; otherwise use the chosen preset.
    return {
        zone_name: available_area.get(zone_name, 0.0) * coverage_ratio
        for zone_name in idf_zone_names
    }
