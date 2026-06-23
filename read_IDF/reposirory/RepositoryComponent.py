from read_IDF import find_every_component
from reposirory.Repository import Repository

class RepositoryComponent(Repository):

    def select_all_components(self, component_properties):
        component_dict = find_every_component(component_properties)

        '''
        components = []

        for component_key in component_dict:
            components.append(
                component_dict[component_key].__dict__
            )
        '''

        return [component_dict[component_key].__dict__ for component_key in component_dict]

    def save_components_to_mongo(self, component_properties):
        components = self.select_all_components(component_properties)  # select all materials from IDF
        collection = self.get_collection()  # get collection
        collection.insert_many(components)