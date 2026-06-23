from pymongo import MongoClient
from pymongo.errors import PyMongoError
from bson.objectid import ObjectId
from changeIDF.database.config.MongoConfig import MongoConfig
from changeIDF.database.ConstructionSetDTO import ConstructionSetDTO, ResponseComponentDescriptorDTO

class ConstructionSetDAO:
    def __init__(self):
        self.collection_name = "temp"

    def select_construction_set(self, userEmail: str, constructionSet: str) -> ConstructionSetDTO:
        try:
            database = MongoConfig().connect_construction_sets()
            collection = database[self.collection_name]

            constructions = list(
                collection.find(
                    {
                        "type": {"$ne": "construction_set"},
                        "userEmail": userEmail
                    },
                    {"_id": 0}
                )
            )

            construction_set = collection.find_one(
                {
                    "type": "construction_set",
                    "name": constructionSet,
                    "userEmail": userEmail
                },
                {"_id": 0}
            )

            if construction_set is None:
                raise RuntimeError(f"No construction set found for user: {userEmail}")

            return ConstructionSetDTO(
                constructions=constructions,
                construction_set=construction_set
            )

        except PyMongoError as e:
            raise ConnectionError(f"MongoDB connection failed: {e}")
        
    def select_with_id(self, userEmail: str, id: str) -> ConstructionSetDTO:
        try:
            database = MongoConfig().connect_construction_sets()
            collection = database[self.collection_name]

            components = list(
                collection.find(
                    {
                        "_id": ObjectId(id),
                        "userEmail": userEmail
                    },
                    {"_id": 0}
                )
            )

            if components is None:
                raise RuntimeError(f"No construction set found for user: {userEmail}")

            return ConstructionSetDTO(
                constructions=components,
                construction_set=None
            )

        except PyMongoError as e:
            raise ConnectionError(f"MongoDB connection failed: {e}")


