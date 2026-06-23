from read_IDF import find_every_component
from dataclasses import dataclass

from construction_set.classify_surface import classify_surface
from construction_set.classify_subsurface import classify_subsurface
from construction_set.surface_properties import surface_properties
from construction_set.construction_set_parts import construction_set_parts

def get_construction_set_from_IDF():

    construction_set = {}

    # Initialize the dict with None values
    for part in construction_set_parts:
        construction_set[part] = None

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


    






