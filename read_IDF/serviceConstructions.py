from mongo_config import MongoConfig
from reposirory.Repository import Repository
from reposirory.RepositoryConstructionSet import RepositoryConstructionSet
from reposirory.RepositoryConstruction import RepositoryConstruction
from reposirory.RepositoryMaterial import RepositoryMaterial

class ServiceConstructions:

    def __init__(self, database_name, collection_name):
        self.database_name = database_name
        self.collection_name = collection_name

        # Repositories
        self.repository_material = RepositoryMaterial(database_name, collection_name)
        self.repository_construction = RepositoryConstruction(database_name, collection_name)
        self.repository_construction_set = RepositoryConstructionSet(database_name, collection_name)

    def save_IDF_to_Mongo(self):
        mongo_config = MongoConfig()
        client = mongo_config.connect()

        # clean the Repository so it contains only the current IDF
        repository = Repository(self.database_name, self.collection_name)
        repository.set_mongo_client(client)
        repository.clean_collection()

        # set Mongo client to Repository
        self.repository_material.set_mongo_client(client)
        self.repository_construction.set_mongo_client(client)
        self.repository_construction_set.set_mongo_client(client)

        self.repository_material.save_materials_to_mongo()
        self.repository_construction.save_constructions_to_mongo()
        self.repository_construction_set.save_construction_set_to_mongo()

        mongo_config.close()


serviceConstructions = ServiceConstructions("construction_set", "idf_constructions")

serviceConstructions.save_IDF_to_Mongo()