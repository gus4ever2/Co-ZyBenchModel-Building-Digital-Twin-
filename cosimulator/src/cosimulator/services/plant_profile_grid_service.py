import json
from pathlib import Path
from typing import Any

from cosimulator.database.dao.plant_profile_grid_dao import (
    PlantProfileGridDAO,
    plant_profile_grid_dao,
)
from cosimulator.schemas.documents.plant_profile_grid import (
    build_plant_profile_grid_document,
)


class PlantProfileGridService:
    """Store and retrieve the generated response grid separate from plant files."""

    def __init__(self, dao: PlantProfileGridDAO = plant_profile_grid_dao):
        self.dao = dao  # Injectable DAO keeps file import easy to test.

    def get(self, *, plant_id: str) -> dict[str, Any] | None:
        """Return the grid identified by the owning plant's MongoDB ID."""
        return self.dao.find_by_plant_id(plant_id=plant_id)

    def import_file(
        self,
        *,
        plant_id: str,
        plant_name: str,
        profile_path: Path,
    ) -> int:
        """Read generator JSON, upsert it and return its number of grid points."""
        # The temporary file is produced by the child generation process.
        with profile_path.open("r", encoding="utf-8") as file:
            profile = json.load(file)
        # Re-generation replaces the existing grid while keeping the plant ID.
        self.dao.upsert(
            document=build_plant_profile_grid_document(
                plant_id=plant_id,
                plant_name=plant_name,
                profile=profile,
            )
        )
        return int(profile["grid_point_count"])


plant_profile_grid_service = PlantProfileGridService()
