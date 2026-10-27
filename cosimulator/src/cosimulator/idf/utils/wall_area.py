"""Shared green-wall geometry for IDF preparation and simulation callbacks."""
from math import sqrt

from eppy.modeleditor import IDF

from cosimulator.schemas.simulation_context import GreenWallSize


def _polygon_area_m2(surface) -> float:
    """Return a planar IDF polygon area without invoking ``eppy.area``.

    ``eppy.area`` delegates to NumPy's determinant implementation.  On this
    Windows/NumPy installation that native call can terminate the worker while
    processing otherwise valid EnergyPlus surfaces.  Newell's method computes
    the same 3-D polygon area directly from the IDF vertex coordinates.
    """
    vertices: list[tuple[float, float, float]] = []  # Ordered 3-D polygon vertices extracted from the IDF surface.
    for index in range(1, 101):
        try:
            x = getattr(surface, f"Vertex_{index}_Xcoordinate")  # X coordinate of the current vertex in the IDF coordinate system.
            y = getattr(surface, f"Vertex_{index}_Ycoordinate")  # Y coordinate of the same vertex.
            z = getattr(surface, f"Vertex_{index}_Zcoordinate")  # Z coordinate of the same vertex.
        except AttributeError:
            break
        if x in (None, "") or y in (None, "") or z in (None, ""):
            break
        vertices.append((float(x), float(y), float(z)))  # Store complete coordinates as numbers for the area calculation.

    if len(vertices) < 3:
        return 0.0

    normal_x = normal_y = normal_z = 0.0  # Newell-method accumulators for the polygon's area vector.
    for current, following in zip(vertices, vertices[1:] + vertices[:1]):  # Visit each edge, including the closing edge back to the first vertex.
        x1, y1, z1 = current
        x2, y2, z2 = following
        normal_x += (y1 - y2) * (z1 + z2)
        normal_y += (z1 - z2) * (x1 + x2)
        normal_z += (x1 - x2) * (y1 + y2)
    return 0.5 * sqrt(normal_x**2 + normal_y**2 + normal_z**2)  # Half the area-vector magnitude gives the 3-D polygon area.


def available_wall_area_by_zone(*, idf: IDF) -> dict[str, float]:
    """Calculate net wall area per zone from the current IDF geometry.

    Every vertical BuildingSurface:Detailed wall contributes its gross area.
    Windows and doors represented as FenestrationSurface:Detailed objects are
    subtracted from their parent wall, leaving the surface that can actually
    receive a green-wall system.
    """
    gross_area_by_zone: dict[str, float] = {}  # Total wall area per zone before subtracting openings.
    wall_zone_by_name: dict[str, str] = {}  # Associate each parent wall name with the zone that owns it.

    for surface in idf.idfobjects["BUILDINGSURFACE:DETAILED"]:
        if str(surface.Surface_Type).strip().lower() != "wall":
            continue
        zone_name = str(surface.Zone_Name).strip()  # Thermal zone receiving this wall's area.
        surface_name = str(surface.Name).strip().lower()  # Normalized wall name used when matching child openings.
        gross_area_by_zone[zone_name] = (
            gross_area_by_zone.get(zone_name, 0.0) + _polygon_area_m2(surface)
        )
        wall_zone_by_name[surface_name] = zone_name

    opening_area_by_zone: dict[str, float] = {}  # Area occupied by windows and doors, aggregated by parent zone.
    for opening in idf.idfobjects["FENESTRATIONSURFACE:DETAILED"]:
        parent_name = str(opening.Building_Surface_Name).strip().lower()  # Find the wall containing this window or door.
        zone_name = wall_zone_by_name.get(parent_name)  # Only subtract openings whose parent is a wall included above.
        if zone_name is None:
            continue
        opening_area_by_zone[zone_name] = (
            opening_area_by_zone.get(zone_name, 0.0) + _polygon_area_m2(opening)
        )

    return {
        zone_name: max(
            gross_area - opening_area_by_zone.get(zone_name, 0.0),
            0.0,
        )
        for zone_name, gross_area in gross_area_by_zone.items()
    }


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
