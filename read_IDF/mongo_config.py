from pymongo import MongoClient
from pymongo.errors import PyMongoError

class MongoConfig:
    def __init__(self):
        self.uri = "mongodb://localhost:27017/"
        self.client = None

    def connect(self):
        try:
            self.client = MongoClient(self.uri)
            self.client.admin.command("ping")
            return self.client
        except PyMongoError as e:
            raise ConnectionError(f"MongoDB connection failed: {e}")

    def close(self):
        if self.client is not None:
            self.client.close()