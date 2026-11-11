from typing import ClassVar

from bson import ObjectId

from pymongo.collection import Collection
from pymongo.database import Database

from cosimulator.database.dao.general_dao import GeneralDAO
from cosimulator.database.mongo_config.mongo_config import MongoConfig
from cosimulator.services.simulation_owner_middleware import SimulationOwner


class SimulationDAO(GeneralDAO):
    _instance: ClassVar["SimulationDAO | None"] = None
    _database: ClassVar[Database | None] = None
    simulation_collection: ClassVar[Collection | None] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SimulationDAO, cls).__new__(cls)
            mongo_config = MongoConfig("simulations")
            cls._database = mongo_config.database
            cls.simulation_collection = mongo_config.collection
        return cls._instance

    @property
    def database(self) -> Database:
        if SimulationDAO._database is None:
            raise RuntimeError("MongoDB database is not initialized")

        return SimulationDAO._database

    @property
    def collection(self) -> Collection:
        if SimulationDAO.simulation_collection is None:
            raise RuntimeError("MongoDB collection is not initialized")

        return SimulationDAO.simulation_collection

    def find_by_owner(self, *, owner: SimulationOwner):
        """Find simulations belonging to exactly one resolved owner."""
        return self.collection.find(owner.mongo_filter()).sort("_id", -1)

    def find_by_id_and_owner(
        self, *, document_id: str, owner: SimulationOwner
    ) -> dict | None:
        """Find one simulation only when the supplied owner matches."""
        return self.collection.find_one(
            {"_id": ObjectId(document_id), **owner.mongo_filter()}
        )


simulation_dao = SimulationDAO()
