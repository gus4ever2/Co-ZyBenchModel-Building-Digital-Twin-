from pymongo import MongoClient
from pymongo.errors import PyMongoError

class MongoConfig:
    def __init__(self):
        self.uri = "mongodb://localhost:27017/"
        self.database_name = "test"
        self.client = None

    def connect_construction_sets(self):
        try:
            self.client = MongoClient(self.uri)
            self.client.admin.command("ping")
            return self.get_database()
        except PyMongoError as e:
            raise ConnectionError(f"MongoDB connection failed: {e}")

    def close(self):
        if self.client is not None:
            self.client.close()

    def get_database(self):
        return self.client[self.database_name]