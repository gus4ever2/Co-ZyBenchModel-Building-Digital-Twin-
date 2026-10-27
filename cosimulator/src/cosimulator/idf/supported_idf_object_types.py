"""Expose the snapshot object types supported by the IDF writer."""

from cosimulator.idf.construction_set.construction_set_idf_object_types import CONSTRUCTION_SET_IDF_OBJECT_TYPES

SUPPORTED_IDF_OBJECT_TYPES:list[str] = [
    *CONSTRUCTION_SET_IDF_OBJECT_TYPES,  # Include the supported construction and material EnergyPlus types.
    "PEOPLE"  # Allow People objects when present in the supplied snapshot.
]
