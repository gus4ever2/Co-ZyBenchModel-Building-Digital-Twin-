from ComponentDTO import ComponentDTO
from eppy_config.config_Eppy import get_idf_objects

def find_every_component(component_property_names)->dict:

    components_dict = {}
    
    # Loads from the dict all the component properties
    for component_type_name, property_names in component_property_names.items():

        idf_objects = get_idf_objects()

        # Read components from IDF file 
        components_idfobject = idf_objects[component_type_name]

        # Load every component (idfobject)
        for component_idfobject in components_idfobject:
            component_dict = {} # stores the properties of every component
            name=""

            # Loads from the dict
            for property_name in property_names:
                if component_idfobject[property_name] != "":
                    component_dict[property_name] = component_idfobject[property_name] # adds the value from the idfobject in dict
                if property_name == "Name":
                    name = component_idfobject[property_name]

            # Creates an object that it store the componet inside a list
            components_dict[name]=(
                ComponentDTO(
                    component_type_name,
                    name,
                    component_dict
                )
            )

    return components_dict