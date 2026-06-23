from read_IDF import find_every_component
from dataclasses import dataclass

from construction_set.classify_surface import classify_surface
from construction_set.classify_subsurface import classify_subsurface
from construction_set.surface_properties import surface_properties
from construction_set.construction_set_parts import construction_set_parts

@dataclass
class surface_component:
    name: str
    category:str


def find_every_component(component_property_names) -> dict:
    components_dict = {}

    # Loads from the dict all the component properties
    for component_type_name, property_names in component_property_names.items():

        idf_objects = get_idf_objects()

        # Read components from IDF file
        components_idfobject = idf_objects[component_type_name]

        # Load every component (idfobject)
        for component_idfobject in components_idfobject:
            component_dict = {}  # stores the properties of every component
            name = ""

            # Loads from the dict
            for property_name in property_names:
                component_dict[property_name] = component_idfobject[
                    property_name]  # adds the value from the idfobject in dict
                if property_name == "Name":
                    name = component_idfobject[property_name]

            # Creates an object that it store the componet inside a list
            components_dict[name] = (
                ComponentDTO(
                    component_type_name,
                    name,
                    component_dict
                )
            )

    return components_dict

@dataclass
class Surface:
    Name: str
    Surface_Type:str
    Outside_Boundary_Condition: str

def set_construction_set(idf_file):

    # key:name, value:category
    surface_array = []

    construction_set = {}

    component_type_name = "BuildingSurface:Detailed"

    # Read components from IDF file
    surface_idfobject = idf_file.idf_objects[component_type_name]

    for surface_idfobject in components_idfobject:
        surface_array.append(
            Surface(
                surface_idfobject["Name"],
            surface_idfobject["Surface_Type"],
            surface_idfobject["Outside_Boundary_Condition"])
        )

        print(surface_array)


    # a dict with the faces and subfaces base on surface_properties
    surface_components_dict = find_every_component(surface_properties)

    # Iterate 
    for component_name in surface_components_dict:
        # name of every face as key
        component = surface_components_dict[component_name]

        surfaceType = ""

        type = getattr(component, 'type')
        properties = getattr(component, 'properties')
        
        # surface
        if type == "BuildingSurface:Detailed":
            surfaceType = classify_surface(properties)
        
        # sub-surface
        elif type == "FenestrationSurface:Detailed":
            component_parent = surface_components_dict[properties["Building_Surface_Name"]]
            surfaceType = classify_subsurface(properties, classify_surface(getattr(component_parent, 'properties')))

        # add the construction to the construction set (every category's face has the same construction)
        if construction_set[surfaceType] == None:
                construction_set[surfaceType] = properties["Construction_Name"]

    return construction_set


    






