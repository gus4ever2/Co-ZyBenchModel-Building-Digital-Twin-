from construction_set.create_construction_set import get_construction_set_from_IDF
from reposirory.Repository import Repository

class RepositoryConstructionSet(Repository):

    def select_construction_set(self):
        return {"type" : "construction_set",
                "name" : "Construction Set 1",
            "properties" : get_construction_set_from_IDF()}
    
    def save_construction_set_to_mongo(self):
        construction_set = self.select_construction_set() # select all materials from IDF
        collection = self.get_collection() # get collection
        collection.insert_one(construction_set)
