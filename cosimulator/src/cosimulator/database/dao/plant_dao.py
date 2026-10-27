from typing import Any, ClassVar

from bson import ObjectId
from pymongo import DESCENDING
from pymongo.collection import Collection
from pymongo.database import Database

from cosimulator.database.dao.general_dao import GeneralDAO
from cosimulator.database.mongo_config.mongo_config import MongoConfig


class PlantDAO(GeneralDAO):
    _instance: ClassVar["PlantDAO | None"] = None
    _database: ClassVar[Database | None] = None
    _collection: ClassVar[Collection | None] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            mongo_config = MongoConfig("plants")
            cls._database = mongo_config.database
            cls._collection = mongo_config.collection
            cls._collection.create_index(
                [("user_email", 1), ("created_at", DESCENDING)]
            )
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

    def find_all_by_user(self, *, user_email: str) -> list[dict[str, Any]]:
        return list(
            self.collection.find({"user_email": user_email, "defaultLibraryId": {"$exists": False}}).sort(
                "created_at", DESCENDING
            )
        )

    def find_completed_by_city_and_name(
        self,
        *,
        city: str,
        plant_name: str,
    ) -> dict[str, Any] | None:
        return self.collection.find_one(
            {
                "parameters.city": city.strip().lower(),
                "parameters.plant_name": plant_name.strip().lower(),
                "status": "COMPLETED",
            },
            sort=[("created_at", DESCENDING)],
        )

    def set_gridfs_file(self, *, plant_id: str, field: str, file_id: ObjectId) -> None:
        self.collection.update_one(
            {"_id": ObjectId(plant_id)},
            {"$set": {field: file_id}},
        )


plant_dao = PlantDAO()
