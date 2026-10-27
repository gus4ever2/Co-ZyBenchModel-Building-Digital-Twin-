"""Assign snapshot constructions to matching building surfaces."""

from dataclasses import dataclass

from eppy.modeleditor import IDF

from cosimulator.core.logger.logging import logger
from cosimulator.database.dto.idf_preparation_dto import IdfObjectDTO
from cosimulator.idf.construction_set.utils.classify_surface import classify_surface
from cosimulator.idf.construction_set.utils.classify_subsurface import classify_subsurface


@dataclass(slots=True, frozen=True, kw_only=True)
class Surface:
    Name: str  # EnergyPlus name of the surface or opening.
    Surface_Type:str  # EnergyPlus surface category, such as Wall, Floor or Window.
    Outside_Boundary_Condition: str  # Indicates whether the surface borders outdoors, ground or another surface.


@dataclass(slots=True, frozen=True, kw_only=True)
class SubSurface:
    Name: str
    Surface_Type:str


def _apply_configured_construction(
    *,
    idf_object,
    category: str,
    construction_set_properties: dict,
) -> None:
    """Apply a configured name without erasing a valid source-IDF value.

    Optional construction-set categories may be blank.  In that case the
    original surface construction remains active instead of writing an empty
    required field that EnergyPlus cannot process.
    """
    configured_name = construction_set_properties.get(category)  # Construction assigned to this classified surface, if the slot is filled.
    if isinstance(configured_name, str) and configured_name.strip():
        idf_object["Construction_Name"] = configured_name.strip()  # Overwrite the source assignment only when a nonblank name was provided.


def change_construction_set(
        *,
        idf: IDF,
        construction_set: IdfObjectDTO
) -> IDF:

    # key:name, value:category
    surface_dict = {}  # Map parent surface names to categories for classifying their openings.

    # load new construction set
    construction_set_properties = construction_set.properties  # Snapshot slots mapping surface categories to construction names.

    """surface"""
    # Read components from IDF file
    all_surfaces_idfobject = idf.idfobjects["BuildingSurface:Detailed"]  # Building surfaces to classify and update in the working IDF.

    for surface_idfobject in all_surfaces_idfobject:
        surface  = Surface(
            Name=surface_idfobject["Name"],
            Surface_Type=surface_idfobject["Surface_Type"],
            Outside_Boundary_Condition=surface_idfobject["Outside_Boundary_Condition"]
        )

        category = classify_surface(surface)  # Select the construction-set slot for this type and boundary condition.
        surface_dict[surface_idfobject["Name"]] = category # surface so sub-face can indentify if they are exterior or interior
        _apply_configured_construction(
            idf_object=surface_idfobject,
            category=category,
            construction_set_properties=construction_set_properties,
        )

    """sub-surface"""
    # Read components from IDF file
    all_sub_surfaces_idfobject = idf.idfobjects["FenestrationSurface:Detailed"]  # Windows and doors require both their own type and their parent's category.

    for sub_surface_idfobject in all_sub_surfaces_idfobject:
        surface = SubSurface( # face
            Name=sub_surface_idfobject["Name"],
            Surface_Type=sub_surface_idfobject["Surface_Type"],
        )

        category = classify_subsurface( # return the category of the face (e.g. window on a roof -> external:window)
                surface, # face
                surface_dict[ # surface so sub-face can indentify if they are exterior or interior
                    sub_surface_idfobject["Building_Surface_Name"] # parent face of a face
                ]
            )
        _apply_configured_construction(
            idf_object=sub_surface_idfobject,
            category=category,
            construction_set_properties=construction_set_properties,
        )

    logger.info(f"Construction Set changed new construction set: {construction_set.name}")

    return idf
