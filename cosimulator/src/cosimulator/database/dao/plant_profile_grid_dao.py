from typing import Any, ClassVar

from pymongo import ASCENDING
from pymongo.collection import Collection
from pymongo.database import Database
from pymongo.results import DeleteResult, UpdateResult

from cosimulator.database.dao.general_dao import GeneralDAO
from cosimulator.database.mongo_config.mongo_config import MongoConfig


class PlantProfileGridDAO(GeneralDAO):
    """Persistence for one time-independent response grid per plant."""

    _instance: ClassVar["PlantProfileGridDAO | None"] = None
    _database: ClassVar[Database | None] = None
    _collection: ClassVar[Collection | None] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            mongo = MongoConfig("plant_profile_grids")
            cls._database = mongo.database
            cls._collection = mongo.collection
            cls._collection.create_index([("plant_id", ASCENDING)], unique=True)
        return cls._instance

    @property
    def database(self) -> Database:
        if self._database is None:
            raise RuntimeError("MongoDB database is not initialized")
        return self._database

    @property
    def collection(self) -> Collection:
        if self._collection is None:
            raise RuntimeError("MongoDB collection is not initialized")
        return self._collection

    def find_by_plant_id(self, *, plant_id: str) -> dict[str, Any] | None:
        return self.collection.find_one({"plant_id": plant_id})

    def upsert(self, *, document: dict[str, Any]) -> UpdateResult:
        return self.collection.replace_one(
            {"plant_id": document["plant_id"]},
            document,
            upsert=True,
        )

    def delete_by_plant_id(self, *, plant_id: str) -> DeleteResult:
        return self.collection.delete_many({"plant_id": plant_id})


plant_profile_grid_dao = PlantProfileGridDAO()
