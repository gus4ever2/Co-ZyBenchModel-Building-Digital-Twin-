from construction_properties import construction_properties
from mongo_config import MongoConfig
from reposirory.RepositoryComponent import RepositoryComponent

class RepositoryConstruction(RepositoryComponent):

    def save_constructions_to_mongo(self):
        self.save_components_to_mongo(construction_properties)
