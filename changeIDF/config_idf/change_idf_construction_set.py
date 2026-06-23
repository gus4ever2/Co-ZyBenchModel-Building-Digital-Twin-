from dataclasses import dataclass
from eppy.modeleditor import IDF
from changeIDF.construction_set.classify_surface import classify_surface
from changeIDF.construction_set.classify_subsurface import classify_subsurface

VALID_IDF_TYPES = {
    "MATERIAL",
    "MATERIAL:NOMASS",
    "MATERIAL:AIRGAP",
    "MATERIAL:INFRAREDTRANSPARENT",
    "MATERIAL:ROOFVEGETATION",

    "WINDOWMATERIAL:GLAZING",
    "WINDOWMATERIAL:GLAZING:REFRACTIONEXTINCTIONMETHOD",
    "WINDOWMATERIAL:GLAZINGGROUP:THERMOCHROMIC",
    "WINDOWMATERIAL:SIMPLEGLAZINGSYSTEM",
    "WINDOWMATERIAL:GAS",
    "WINDOWMATERIAL:GASMIXTURE",
    "WINDOWMATERIAL:SHADE",
    "WINDOWMATERIAL:SCREEN",
    "WINDOWMATERIAL:BLIND",

    "CONSTRUCTION",
    "CONSTRUCTIONPROPERTY:INTERNALHEATSOURCE",
    "CONSTRUCTION:CFACTORUNDERGROUNDWALL",
    "CONSTRUCTION:FFACTORGROUNDFLOOR",
    "CONSTRUCTION:WINDOWDATAFILE",
    "CONSTRUCTION:AIRBOUNDARY",

    "LIGHTS",
    "PEOPLE",
    "ELECTRICEQUIPMENT",
    "ZONEINFILTRATION:DESIGNFLOWRATE",
    "SPACELIST",
    "SPACE",

    "SCHEDULE:YEAR",
    "SCHEDULE:DAY:INTERVAL",
    "SCHEDULE:WEEK:DAILY",
}


def normalize_type(object_type: str) -> str:
    return object_type.strip().upper()


def clean_properties(properties: dict) -> dict:
    """
    Removes Mongo/internal/null values before sending to eppy.
    Empty strings are kept because EnergyPlus often accepts blank fields.
    """
    cleaned = {}

    for key, value in properties.items():
        if value is None:
            continue

        if key.startswith("_"):
            continue

        cleaned[key] = value

    return cleaned


def upsert_idf_object(idf: IDF, object_data: dict):
    raw_type = object_data.get("type")

    if raw_type is None:
        print(f"SKIP: object has no type -> {object_data.get('name')}")
        return None

    object_type = normalize_type(raw_type)

    # Skip anything not in your allowed EnergyPlus types
    if object_type not in VALID_IDF_TYPES:
        print(f"SKIP: unsupported/non-IDF type -> {raw_type} | {object_data.get('name')}")
        return None

    # Check if the type exists in the loaded IDD
    if object_type not in idf.idfobjects:
        print(f"SKIP: type not found in IDD -> {object_type} | {object_data.get('name')}")
        return None

    properties = object_data.get("properties")

    if properties is None:
        print(f"SKIP: no properties -> {object_type} | {object_data.get('name')}")
        return None

    properties = clean_properties(properties)

    object_name = object_data.get("name") or properties.get("Name")

    if object_name is None:
        print(f"SKIP: no name -> {object_type}")
        return None

    if "Name" in properties:
        properties["Name"] = object_name

    # Delete old object with same Name
    existing_objects = [
        idf_object
        for idf_object in idf.idfobjects[object_type]
        if hasattr(idf_object, "Name") and idf_object.Name == object_name
    ]

    for old_object in existing_objects:
        idf.removeidfobject(old_object)

    # Add new object
    new_object = idf.newidfobject(object_type)

    for field_name, field_value in properties.items():
        setattr(new_object, field_name, field_value)

    print(f"UPSERT: {object_type} | {object_name}")
    return new_object


def upsert_many_idf_objects(idf: IDF, mongo_objects: list[dict]):
    for object_data in mongo_objects:
        upsert_idf_object(idf, object_data)

    return idf

"""
def delete_constructions(idf_file):

    for component in materials_and_constructions_types:
        idf_file.removeallidfobjects(component)

    return idf_file

def add_constructions(idf_file, construction_set_dict):
    #construction_set_dict = get_construction_set_dict(construction_set_path)

    #print(construction_set_dict["constructions"])

    for construction in construction_set_dict["constructions"]:
        print(construction)
        print()
        print()
        idf_file.newidfobject(construction["type"], **construction["properties"])

    return idf_file
"""
@dataclass
class Surface:
    Name: str
    Surface_Type:str
    Outside_Boundary_Condition: str

@dataclass
class SubSurface:
    Name: str
    Surface_Type:str
    Outside_Boundary_Condition: str

def set_construction_set(idf_file, new_construction_set):

    # key:name, value:category
    surface_dict = {}

    # load new construction set
    #new_construction_set = get_construction_set_dict("189_1_2009_CZ1_Office.json")
    new_construction_set = new_construction_set["construction_set"]
    new_construction_set = new_construction_set["properties"]

    """surface"""
    # Read components from IDF file
    all_surfaces_idfobject = idf_file.idfobjects["BuildingSurface:Detailed"]

    for surface_idfobject in all_surfaces_idfobject:
        surface  = Surface(
            surface_idfobject["Name"],
            surface_idfobject["Surface_Type"],
            surface_idfobject["Outside_Boundary_Condition"]
        )

        surface_dict[surface_idfobject["Name"]] = classify_surface(surface) # surface so sub-face can indentify if they are exterior or interior

        surface_idfobject["Construction_Name"] = new_construction_set[ # new constructions (e.g. key external:window value construction name)
            classify_surface( # return the category of the face (e.g. roof outside-> external:roof)
                surface # face
            )
        ]

    """sub-surface"""
    # Read components from IDF file
    all_sub_surfaces_idfobject = idf_file.idfobjects["FenestrationSurface:Detailed"]

    for sub_surface_idfobject in all_sub_surfaces_idfobject:
        surface = Surface( # face
            sub_surface_idfobject["Name"],
            sub_surface_idfobject["Surface_Type"],
            None
        )

        sub_surface_idfobject["Construction_Name"] = new_construction_set[ # new constructions (e.g. key external:window value construction name)
            classify_subsurface( # return the category of the face (e.g. window on a roof -> external:window)
                surface, # face
                surface_dict[ # surface so sub-face can indentify if they are exterior or interior
                    sub_surface_idfobject["Building_Surface_Name"] # parent face of a face
                ]
            )
        ]

    return idf_file

def change_idf_construction_set(idf_file_old, new_construction_set):
    #idf_file_new = delete_constructions(idf_file_old)
    #idf_file_new = add_constructions(idf_file_new, new_construction_set)
    #idf_file_new = upsert_idf_object(idf_file_old, new_construction_set["constructions"])
    idf_file_new = upsert_many_idf_objects(idf_file_old, new_construction_set["constructions"])
    return set_construction_set(idf_file_new, new_construction_set)

