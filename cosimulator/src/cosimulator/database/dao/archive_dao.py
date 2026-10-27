from typing import Any, ClassVar, Mapping

from pymongo.collection import Collection
from pymongo.database import Database

from cosimulator.database.dao.general_dao import GeneralDAO
from cosimulator.database.mongo_config.mongo_config import MongoConfig

class ArchiveDAO(GeneralDAO):
    _instance: ClassVar["ArchiveDAO | None"] = None
    _database: ClassVar[Database | None] = None
    archive_collection: ClassVar[Collection | None] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ArchiveDAO, cls).__new__(cls)
            mongo_config = MongoConfig("archive")
            cls._database = mongo_config.database
            cls.archive_collection = mongo_config.collection
        return cls._instance

    @property
    def database(self) -> Database:
        if ArchiveDAO._database is None:
            raise RuntimeError("MongoDB database is not initialized")

        return ArchiveDAO._database

    @property
    def collection(self) -> Collection:
        if ArchiveDAO.archive_collection is None:
            raise RuntimeError("MongoDB collection is not initialized")

        return ArchiveDAO.archive_collection

    def find_by_simulation_id(self, simulation_id: str) -> dict[str, Any] | None:
        return self.collection.find_one(
            {"simulation_id": simulation_id}
        )

archive_dao = ArchiveDAO()
