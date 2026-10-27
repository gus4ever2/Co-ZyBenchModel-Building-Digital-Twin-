"""Find exterior windows grouped by their thermal zone."""

from eppy.modeleditor import IDF


_OPENING_TYPES = {"WINDOW", "DOOR", "GLASSDOOR"}


def _opening_vertex_signature(*, opening) -> tuple[tuple[float, float, float], ...]:
    """Identify two reciprocal interior openings without relying on names."""
    vertices: list[tuple[float, float, float]] = []  # Collect 3-D opening vertices to identify matching interior openings.
    for index in range(1, 121):
        x_coordinate = getattr(opening, f"Vertex_{index}_Xcoordinate", "")  # A missing X coordinate marks the end of the available vertices.
        if x_coordinate == "":
            break
        vertices.append(
            (
                round(float(x_coordinate), 8),
                round(float(getattr(opening, f"Vertex_{index}_Ycoordinate")), 8),
                round(float(getattr(opening, f"Vertex_{index}_Zcoordinate")), 8),
            )
        )
    return tuple(sorted(vertices))  # Sorting makes the signature independent of vertex ordering.


def find_exterior_window_names_by_zone(
    *,
    idf: IDF,
) -> dict[str, list[str]]:
    windows_by_zone: dict[str, list[str]] = {}  # Thermal zone name mapped to its exterior window names.

    building_surfaces = {  # Parent-surface lookup used to find each opening's boundary and zone.
        surface.Name: surface
        for surface in idf.idfobjects["BuildingSurface:Detailed"]
    }

    for subsurface in idf.idfobjects["FenestrationSurface:Detailed"]:
        if subsurface.Surface_Type != "Window":  # Only windows participate in the exterior-window control.
            continue

        parent_surface = building_surfaces.get(
            subsurface.Building_Surface_Name
        )
        if parent_surface is None:
            raise ValueError(
                "Parent surface was not found for window "
                f"'{subsurface.Name}'"
            )

        if parent_surface.Outside_Boundary_Condition != "Outdoors":  # Ignore windows whose parent surface is not exterior.
            continue

        windows_by_zone.setdefault(
            parent_surface.Zone_Name,
            [],
        ).append(subsurface.Name)

    return windows_by_zone


def find_interior_opening_names(*, idf: IDF) -> set[str]:
    """Return one AFN linkage per physical interior door/window opening.

    EnergyPlus geometry normally contains reciprocal FenestrationSurface
    objects for an opening between two zones. AirflowNetwork must reference
    only one of the pair; otherwise it counts the same airflow twice.
    """
    building_surfaces = {
        surface.Name: surface
        for surface in idf.idfobjects["BuildingSurface:Detailed"]
    }
    unique_openings: dict[tuple[tuple[float, float, float], ...], str] = {}  # Vertex signature mapped to one representative of each interior opening.

    for opening in idf.idfobjects["FenestrationSurface:Detailed"]:
        if opening.Surface_Type.upper() not in _OPENING_TYPES:
            continue

        parent_surface = building_surfaces.get(opening.Building_Surface_Name)
        if parent_surface is None:
            raise ValueError(
                "Parent surface was not found for interior opening "
                f"'{opening.Name}'"
            )
        if parent_surface.Outside_Boundary_Condition != "Surface":
            continue

        signature = _opening_vertex_signature(opening=opening)  # Both sides of one physical opening should have the same vertices.
        existing_name = unique_openings.get(signature)  # Find the representative already selected for this opening.
        if existing_name is None or opening.Name < existing_name:
            unique_openings[signature] = opening.Name  # Choose a deterministic name when reciprocal sides have the same geometry.

    return set(unique_openings.values())
