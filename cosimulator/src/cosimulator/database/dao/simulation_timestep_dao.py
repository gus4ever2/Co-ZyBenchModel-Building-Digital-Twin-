from typing import Any, ClassVar, Mapping

from pymongo import ASCENDING, DESCENDING
from pymongo.collection import Collection
from pymongo.database import Database
from pymongo.results import DeleteResult

from cosimulator.database.dao.general_dao import GeneralDAO
from cosimulator.database.mongo_config.mongo_config import MongoConfig


class SimulationTimestepDAO(GeneralDAO):
    _instance: ClassVar["SimulationTimestepDAO | None"] = None
    _database: ClassVar[Database | None] = None
    _collection: ClassVar[Collection | None] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)

            mongo_config = MongoConfig("simulation_timesteps")

            cls._database = mongo_config.database
            cls._collection = mongo_config.collection

            cls._collection.create_index(
                [
                    ("user_email", ASCENDING),
                    ("simulation_id", ASCENDING),
                    ("timestep_number", ASCENDING),
                ],
                unique=True,
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

    def find_by_simulation_and_number(
            self,
            user_email: str,
            simulation_id: str,
            timestep_number: int,
    ) -> dict[str, Any] | None:
        return self.collection.find_one(
            {
                "user_email": user_email,
                "simulation_id": simulation_id,
                "timestep_number": timestep_number,
            }
        )

    def find_next(
            self,
            user_email: str,
            simulation_id: str,
            current_timestep_number: int,
    ) -> dict[str, Any] | None:
        return self.collection.find_one(
            {
                "user_email": user_email,
                "simulation_id": simulation_id,
                "timestep_number": {
                    "$gt": current_timestep_number,
                },
            },
            sort=[("timestep_number", ASCENDING)],
        )

    def find_previous(
            self,
            user_email: str,
            simulation_id: str,
            current_timestep_number: int,
    ) -> dict[str, Any] | None:
        return self.collection.find_one(
            {
                "user_email": user_email,
                "simulation_id": simulation_id,
                "timestep_number": {
                    "$lt": current_timestep_number,
                },
            },
            sort=[("timestep_number", DESCENDING)],
        )

    def find_all_by_simulation(
            self,
            user_email: str,
            simulation_id: str,
            limit: int | None = None,
            offset: int = 0,
    ) -> list[Mapping[str, Any]]:
        cursor = self.collection.find(
            {
                "user_email": user_email,
                "simulation_id": simulation_id,
            }
        ).sort("timestep_number", ASCENDING).skip(offset)

        if limit is not None:
            cursor = cursor.limit(limit)

        return list(cursor)

    def delete_all_by_simulation(
            self,
            user_email: str,
            simulation_id: str,
    ) -> DeleteResult:
        return self.collection.delete_many(
            {
                "user_email": user_email,
                "simulation_id": simulation_id,
            }
        )


simulation_timestep_dao = SimulationTimestepDAO()
