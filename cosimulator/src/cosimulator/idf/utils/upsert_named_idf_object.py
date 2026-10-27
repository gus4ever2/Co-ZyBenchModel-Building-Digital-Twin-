"""Create or update a uniquely named IDF object."""

from typing import Any


def upsert_named_idf_object(idf, kind: str, name: str, **fields: Any):
    """Update one named object or create it; reject ambiguous duplicates."""
    matches = [obj for obj in idf.idfobjects[kind] if str(obj.Name).casefold() == name.casefold()]  # EnergyPlus object names are matched case-insensitively.
    if len(matches) > 1:  # Ambiguous duplicates cannot be safely updated.
        raise ValueError(f"Duplicate IDF object: {name}")
    obj = matches[0] if matches else idf.newidfobject(kind, Name=name)  # Reuse the existing named object or create it if absent.
    for key, value in fields.items():
        setattr(obj, key, value)  # Apply the requested fields without changing other fields.
    return obj
