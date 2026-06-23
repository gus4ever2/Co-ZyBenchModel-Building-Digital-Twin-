from pymongo import MongoClient

class Repository:

    def __init__(self, database_name, collection_name):
        self.database_name = database_name
        self.collection_name = collection_name

    def set_mongo_client(self, client:MongoClient):
        self.client = client

    def get_database(self):
        return self.client[self.database_name]

    def get_collection(self):
        database = self.get_database()
        return database[self.collection_name]

    def clean_collection(self):
        collection = self.get_collection()
        collection.delete_many({}) # delete the old ones