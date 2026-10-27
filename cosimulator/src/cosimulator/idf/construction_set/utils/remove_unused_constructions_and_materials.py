"""Retain referenced constructions and materials and remove unused definitions."""

from collections import deque

from eppy.modeleditor import IDF


def _is_construction_or_material(object_type: str) -> bool:
    kind = object_type.upper()  # Normalize the EnergyPlus type before testing its material/construction family.
    return (kind == "CONSTRUCTION" or kind.startswith("CONSTRUCTION:")
            or kind == "MATERIAL" or kind.startswith("MATERIAL:")
            or kind.startswith("WINDOWMATERIAL:"))


def _referenced_names(idf_object) -> set[str]:
    """Use every populated text field to conservatively retain references."""
    return {value.strip().casefold() for value in idf_object.fieldvalues
            if isinstance(value, str) and value.strip()}


def remove_unused_constructions_and_materials(idf: IDF) -> None:
    """Remove only definitions unreachable from all other IDF objects.

    Scan all text fields instead of assuming that only building surfaces can
    refer to constructions or materials. Following references transitively
    retains construction layers and material-to-material dependencies.
    """
    candidates: dict[str, list] = {}  # Normalized name to definitions eligible for cleanup.
    roots: set[str] = set()  # All text values found in non-candidate IDF objects.
    for object_type, objects in idf.idfobjects.items():
        if _is_construction_or_material(object_type):
            for obj in objects:
                name = str(getattr(obj, "Name", "")).strip().casefold()  # Case-insensitive key used to find references to this definition.
                if name:
                    candidates.setdefault(name, []).append(obj)
        else:
            for obj in objects:
                roots.update(_referenced_names(obj))  # Treat any matching text as a possible reference to avoid unsafe deletion.

    reachable: set[str] = set()  # Candidate names already proven to be reachable from another IDF object.
    pending = deque(roots.intersection(candidates))  # Start traversal with definitions referenced by non-candidate objects.
    while pending:
        name = pending.popleft()  # Visit one potentially referenced construction or material.
        if name in reachable:
            continue
        reachable.add(name)  # Preserve this definition and follow its own dependencies.
        for obj in candidates[name]:
            pending.extend((_referenced_names(obj) & candidates.keys()) - reachable)  # Follow indirect references, such as construction layers and material links.

    for name, objects in candidates.items():
        if name not in reachable:  # Only remove named definitions that are unreachable from all roots.
            for obj in objects:
                idf.removeidfobject(obj)  # Delete an unused definition from the simulation's working IDF.
