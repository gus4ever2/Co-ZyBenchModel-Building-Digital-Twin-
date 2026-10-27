from abc import ABC, abstractmethod
from typing import Any, Mapping

from bson import ObjectId
from pymongo.collection import Collection
from pymongo.results import DeleteResult, UpdateResult, InsertOneResult
from pymongo.synchronous.cursor import Cursor


class GeneralDAO(ABC):

    @property
    @abstractmethod
    def collection(self) -> Collection:
        raise NotImplementedError

    def create(self, document_data: dict[str, Any]) -> str:
        result = self.collection.insert_one(document_data)
        return str(result.inserted_id)

    def find_by_id(self, document_id: str) -> dict[str, Any] | None:
        return self.collection.find_one(
            {"_id": ObjectId(document_id)}
        )


    def find_by_id_and_user_email(
            self,
            document_id: str,
            user_email: str,
    ) -> dict[str, Any] | None:
        return self.collection.find_one(
            {
                "_id": ObjectId(document_id),
                "user_email": user_email,
            }
        )

    def find_by_name_and_user_email(
            self,
            name: str,
            user_email: str,
    ) -> dict[str, Any] | None:
        return self.collection.find_one(
            {
                "name": name,
                "userEmail": user_email,
            }
        )

    def find_by_user_email_completed(
            self,
            user_email: str,
    ) -> Cursor[Mapping[str, Any] | Any]:
        return self.collection.find(
            {
                "user_email": user_email,
                "status": "COMPLETED",
            }
        )

    def update_fields(
            self,
            document_id: str,
            fields: dict[str, Any],
    ) -> UpdateResult:
        return self.collection.update_one(
            {"_id": ObjectId(document_id)},
            {"$set": fields},
        )

    def save(self, document_data: dict[str, Any]) -> InsertOneResult:
        return self.collection.insert_one(document_data)

    def delete_by_id_and_user_email(
            self,
            document_id: str,
            user_email: str,
    ) -> DeleteResult:
        return self.collection.delete_one(
            {
                "_id": ObjectId(document_id),
                "user_email": user_email,
            }
        )

    def find_by_user_email(
            self,
            user_email: str,
    ) -> Cursor[Mapping[str, Any] | Any]:
        return self.collection.find(
            {"user_email": user_email}
        ).sort("_id", -1)
