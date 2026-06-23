from material_properties import material_properties
from mongo_config import MongoConfig
from reposirory.RepositoryComponent import RepositoryComponent

class RepositoryMaterial(RepositoryComponent):

    def save_materials_to_mongo(self):
        self.save_components_to_mongo(material_properties)

mongo_config = MongoConfig()
client = mongo_config.connect()

r = RepositoryMaterial("construction_set", "idf_constructions")
r.set_mongo_client(client)
r.clean_collection()
r.save_materials_to_mongo()
mongo_config.close()




