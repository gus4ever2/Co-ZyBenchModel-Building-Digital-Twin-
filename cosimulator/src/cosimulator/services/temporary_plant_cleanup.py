"""Cleanup for simulation-scoped temporary default-library plants."""

from bson import ObjectId

from cosimulator.core.logger.logging import logger
from cosimulator.database.dao.plant_dao import plant_dao


def delete_temporary_plant_if_owned(
    *,
    simulation_id: str,
    user_email: str,
    temporary_plant_id: str | None,
) -> None:
    """Delete only the temporary plant copy created for one simulation."""
    if not temporary_plant_id or not ObjectId.is_valid(temporary_plant_id):
        return
    try:
        # ``defaultLibraryId`` identifies a simulation copy, never the source.
        query = {
            "_id": ObjectId(temporary_plant_id),
            "user_email": user_email,
            "defaultLibraryId": {"$type": "string"},
        }
        if plant_dao.collection.find_one(query, {"_id": True}):
            plant_dao.database.get_collection("plant_profile_grids").delete_one(
                {"plant_id": temporary_plant_id},
            )
            plant_dao.collection.delete_one(query)
    except Exception:
        logger.exception("Could not clean up temporary plant for %s", simulation_id)
