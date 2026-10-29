"""Static geometry for the exterior windows used by window-opening control."""

from eppy.modeleditor import IDF

from cosimulator.idf.airflow.find_exterior_windows_by_zone import (
    find_exterior_window_names_by_zone,
)
from cosimulator.idf.utils.wall_area import polygon_area_m2


def openable_window_geometry_by_zone(
    *, idf: IDF, zone_names: set[str]
) -> dict[str, dict[str, float]]:
    """Return count and total area for each zone's controllable exterior windows."""
    windows_by_zone = find_exterior_window_names_by_zone(idf=idf)
    surfaces_by_name = {
        str(surface.Name).strip(): surface
        for surface in idf.idfobjects["FENESTRATIONSURFACE:DETAILED"]
    }
    return {
        zone_name: {
            "openable_window_count": float(
                len(windows_by_zone.get(zone_name, []))
            ),
            "openable_window_area_m2": sum(
                polygon_area_m2(surfaces_by_name[window_name])
                for window_name in windows_by_zone.get(zone_name, [])
                if window_name in surfaces_by_name
            ),
        }
        for zone_name in zone_names
    }
