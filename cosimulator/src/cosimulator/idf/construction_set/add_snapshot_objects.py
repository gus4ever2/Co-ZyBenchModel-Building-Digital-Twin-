"""Write supported objects from a saved construction-set snapshot."""

from cosimulator.core.logger.logging import logger
from eppy.modeleditor import IDF

from cosimulator.database.dto.idf_preparation_dto import IdfObjectDTO
from cosimulator.idf.supported_idf_object_types import SUPPORTED_IDF_OBJECT_TYPES

# Snapshot normalisation ----------------------------------------------------
# Clean Mongo snapshot fields before constructing equivalent EnergyPlus objects.

def _normalize_type(object_type: str) -> str:
    return object_type.strip().upper()


def _normalize_field_name(field_name: str) -> str:
    return field_name.replace("_", "").casefold()


def _clean_properties(properties: dict) -> dict:
    """
    Remove values that should remain unset in the generated IDF object.

    In particular, assigning an empty string to an extensible Construction
    layer makes Eppy serialize that layer. EnergyPlus then treats it as a
    referenced material with an empty name and terminates during input
    validation. Leaving the field unset lets Eppy stop after the last real
    construction layer.
    """
    cleaned = {}  # Accumulate only fields that should actually be written to the IDF.

    for key, value in properties.items():  # Inspect each field from the immutable construction snapshot.
        if value is None:  # Do not write missing values into EnergyPlus fields.
            continue

        if isinstance(value, str) and not value.strip():  # Blank values must stay unset, especially for optional construction layers.
            continue

        if key.startswith("_"):  # Internal metadata is not an EnergyPlus field.
            continue

        cleaned[key] = value  # Preserve a valid field using its original snapshot name.

    return cleaned


def _has_required_construction_layer(properties: dict) -> bool:
    """Return whether a Construction has the required first material layer."""
    for field_name, value in properties.items():
        if _normalize_field_name(field_name) != "outsidelayer":
            continue
        return isinstance(value, str) and bool(value.strip())
    return False


def _same_name_types(idf: IDF, object_type: str) -> list[str]:
    """Find the EnergyPlus name namespace in which replacement must occur."""
    if object_type == "CONSTRUCTION" or object_type.startswith("CONSTRUCTION:"):
        return [
            key
            for key in idf.idfobjects
            if key.upper() == "CONSTRUCTION" or key.upper().startswith("CONSTRUCTION:")
        ]
    if object_type == "MATERIAL" or object_type.startswith(("MATERIAL:", "WINDOWMATERIAL:")):
        return [
            key
            for key in idf.idfobjects
            if key.upper() == "MATERIAL"
            or key.upper().startswith(("MATERIAL:", "WINDOWMATERIAL:"))
        ]
    return [object_type]


def _add_idf_object(
    *,
    idf: IDF,
    idf_object: IdfObjectDTO,
) -> IDF:
    """Replace the matching IDF object with one captured in the snapshot."""
    raw_type = idf_object.type  # Object type supplied by the construction snapshot.

    if raw_type is None:
        logger.info(f"SKIP: object has no type")
        return idf

    object_type = _normalize_type(raw_type)  # Normalize the type before comparing it with the supported IDD types.

    # Ignore objects that the application cannot safely write to the IDF.
    if object_type not in SUPPORTED_IDF_OBJECT_TYPES:
        logger.info(f"SKIP: unsupported/non-IDF type -> {raw_type}")
        return idf

    # An application type must also exist in the currently loaded EnergyPlus IDD.
    if object_type not in idf.idfobjects:
        logger.info(f"SKIP: type not found in IDD -> {object_type}")
        return idf

    properties = _clean_properties(idf_object.properties)  # Drop blank and internal values before creating the object.

    if object_type == "CONSTRUCTION" and not _has_required_construction_layer(
            properties
    ):
        logger.warning(
            "SKIP: Construction %r has no Outside_Layer and cannot be "
            "written to EnergyPlus input",
            properties.get("Name", idf_object.name),
        )
        return idf

    object_name = properties.get("Name")  # EnergyPlus name used for replacement and subsequent references.

    if object_name is None:
        logger.info(f"SKIP: no name -> {object_type}")
        return idf

    if "Name" in properties:
        properties["Name"] = object_name

    # Names are case-insensitive in EnergyPlus; construction and material
    # variants also share a namespace. Leave differently named objects intact.
    existing_objects = [  # Collect matching names across the relevant EnergyPlus name namespace.
        existing
        for key in _same_name_types(idf, object_type)
        for existing in idf.idfobjects[key]
        if hasattr(existing, "Name")
        and str(existing.Name).strip().casefold() == str(object_name).strip().casefold()
    ]

    for old_object in existing_objects:
        idf.removeidfobject(old_object)  # Replace only same-name objects; unrelated objects remain intact.

    new_object = idf.newidfobject(object_type)  # Create the target object before assigning its EnergyPlus fields.

    # Snapshot keys and Eppy's field names can differ in underscores or case.
    idf_field_names = {  # Map normalized field names back to the exact Eppy field names.
        _normalize_field_name(field_name): field_name
        for field_name in new_object.objls
        if field_name != "key"
    }

    for field_name, field_value in properties.items():
        normalized_field_name = _normalize_field_name(field_name)  # Ignore case and underscores when comparing snapshot and IDD names.
        resolved_field_name = idf_field_names.get(normalized_field_name)  # Look up the actual Eppy field name, if supported by this object.

        if resolved_field_name is None:
            raise ValueError(
                f"Unsupported field '{field_name}' for IDF object "
                f"type '{object_type}'"
            )

        setattr(new_object, resolved_field_name, field_value)  # Copy the validated snapshot value into the working IDF.

    logger.info(f"Added: {object_type} | {object_name}")
    return idf


def add_idf_objects(
    *,
    idf: IDF,
    idf_objects: list[IdfObjectDTO],
) -> IDF:
    """Apply the snapshot objects without removing unrelated IDF objects."""
    for object_data in idf_objects:
        idf = _add_idf_object(
            idf=idf,
            idf_object=object_data,
        )

    return idf
