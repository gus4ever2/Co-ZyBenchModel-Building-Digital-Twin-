"""Find zones with enough airflow links for the network."""

from eppy.modeleditor import IDF


def find_zones_with_two_airflow_links(idf: IDF) -> set[str]:
    """Return zones with the minimum number of AirflowNetwork connections."""
    surfaces = {surface.Name: surface for surface in idf.idfobjects["BuildingSurface:Detailed"]}  # Look up each building surface by the name referenced by an AFN linkage.
    openings = {opening.Name: opening for opening in idf.idfobjects["FenestrationSurface:Detailed"]}  # Look up openings so their parent building surface can be resolved.
    counts: dict[str, int] = {}  # Number of airflow linkages associated with each thermal zone.
    for linkage in idf.idfobjects["AirflowNetwork:MultiZone:Surface"]:
        surface = surfaces.get(linkage.Surface_Name)  # A linkage may reference either a building surface or an opening.
        if surface is None:
            opening = openings.get(linkage.Surface_Name)  # Resolve an opening before looking up its parent surface.
            surface = surfaces.get(opening.Building_Surface_Name) if opening is not None else None
        if surface is None:
            continue
        zones = {surface.Zone_Name}  # Count the connection for the zone owning the surface.
        if surface.Outside_Boundary_Condition == "Surface":
            adjacent = surfaces.get(surface.Outside_Boundary_Condition_Object)  # An interior surface can also connect an adjacent thermal zone.
            if adjacent is not None:
                zones.add(adjacent.Zone_Name)
        for zone in zones:
            counts[zone] = counts.get(zone, 0) + 1  # Increment once for each zone served by this linkage.
    return {zone for zone, count in counts.items() if count >= 2}  # Only zones with at least two links qualify for AirflowNetwork.
