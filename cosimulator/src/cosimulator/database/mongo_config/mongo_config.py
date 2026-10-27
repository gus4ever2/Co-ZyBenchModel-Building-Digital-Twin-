from typing import ClassVar

from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database

from cosimulator.core.config import settings


class MongoConfig:
    _client: ClassVar[MongoClient | None] = None
    _database: ClassVar[Database | None] = None

    def __init__(self, collection_name: str) -> None:
        self.collection_name: str = collection_name

        if MongoConfig._client is None:
            MongoConfig._client = MongoClient(settings.mongo_uri)
            MongoConfig._database = MongoConfig._client[
                settings.mongo_database
            ]

    @property
    def database(self) -> Database:
        if MongoConfig._database is None:
            raise RuntimeError("MongoDB database is not initialized")

        return MongoConfig._database
    
    @property
    def collection(self) -> Collection:
        return self.database.get_collection(self.collection_name)

    @classmethod
    def close(cls) -> None:
        if cls._client is not None:
            cls._client.close()
            cls._client = None
            cls._database = None
