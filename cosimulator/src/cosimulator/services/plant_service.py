from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import shutil
from typing import Any

import gridfs
from bson import ObjectId
from gridfs.grid_file import GridOut

from cosimulator.core.paths.project_paths import WORKSPACE_DIR
from cosimulator.database.dao.plant_dao import plant_dao
from cosimulator.enums.run_status import RunStatus
from cosimulator.plant.obj_caribu_plantecophys_grid import (
    PlantParameters,
)
from cosimulator.schemas.documents.plant import (
    build_base_plant_document,
)
from cosimulator.services.plant_profile_grid_service import (
    plant_profile_grid_service,
)
from cosimulator.services.plant_process_registry import (
    get_plant_process,
    remove_plant_process,
)


class PlantService:
    """Plant documents, owned GridFS files and local workspace cleanup."""

    @property
    def dao(self):
        """DAO for durable plant metadata; generation lives in another module."""
        return plant_dao

    @property
    def gridfs(self) -> gridfs.GridFS:
        """GridFS bucket that stores the normalized preview OBJ and MTL files."""
        return gridfs.GridFS(self.dao.database, collection="plant_models")

    def initialize_process(
        self,
        *,
        user_email: str,
        plant_name: str,
        parameters: PlantParameters,
        grid_preset: str = "standard",
    ) -> str:
        """Create a PENDING plant document before the background worker starts."""
        return self.dao.create(
            build_base_plant_document(
                user_email=user_email,
                plant_name=plant_name,
                parameters=parameters,
                grid_preset=grid_preset,
            )
        )

    def update(self, *, plant_id: str, fields: dict[str, Any]) -> None:
        """Apply worker lifecycle/progress fields without replacing the document."""
        self.dao.update_fields(plant_id, fields)

    def get(self, *, plant_id: str, user_email: str) -> dict[str, Any] | None:
        """Read one owned plant and repair a stale in-memory worker status."""
        document = self.dao.find_by_id_and_user_email(plant_id, user_email)
        return self._reconcile_process_status(document)

    def list_for_user(self, *, user_email: str) -> list[dict[str, Any]]:
        """Read all owned plants while reconciling stopped local workers."""
        return [
            document
            for item in self.dao.find_all_by_user(user_email=user_email)
            if (document := self._reconcile_process_status(item)) is not None
        ]

    def _reconcile_process_status(
        self,
        document: dict[str, Any] | None,
    ) -> dict[str, Any] | None:
        """Replace a stale Mongo RUNNING state after its process has stopped.

        Plant processes live only in the FastAPI server that launched them. If
        that server is stopped or restarted, Mongo can retain RUNNING even
        though no computation remains. API reads reconcile that persisted state
        with the in-memory process registry so clients do not poll forever.
        """
        if document is None or document.get("status") not in {
            RunStatus.PENDING.value,
            RunStatus.RUNNING.value,
        }:
            return document

        plant_id = str(document["_id"])
        process = get_plant_process(plant_id=plant_id)
        if process is not None and process.is_alive():
            return document

        # MongoDB can say RUNNING after an API restart; no live worker means
        # the client must see a terminal error instead of polling forever.
        fields = {
            "status": RunStatus.ERROR.value,
            "error": "Plant generation stopped before completion.",
            "end_time": datetime.now(timezone.utc),
        }
        self.update(plant_id=plant_id, fields=fields)
        document.update(fields)
        remove_plant_process(plant_id=plant_id)
        return document

    def store_model_file(
        self,
        *,
        plant_id: str,
        field: str,
        path: Path,
        content_type: str,
    ) -> ObjectId:
        """Store one normalized model file in GridFS and save its file ID."""
        # GridFS metadata preserves ownership/type without duplicating content.
        file_id = self.gridfs.put(
            path.read_bytes(),
            filename=path.name,
            content_type=content_type,
            metadata={"plant_id": plant_id, "kind": field},
        )
        self.dao.set_gridfs_file(
            plant_id=plant_id,
            field=field,
            file_id=file_id,
        )
        return file_id

    def read_model_file(
        self,
        *,
        plant_id: str,
        user_email: str,
        field: str,
    ) -> GridOut | None:
        """Return an owned GridFS file, or None when the requested file is absent."""
        plant = self.get(plant_id=plant_id, user_email=user_email)
        if plant is None or plant.get(field) is None:
            return None
        return self.gridfs.get(plant[field])

    def delete(self, *, plant_id: str, user_email: str) -> bool:
        """Delete an owned finished plant, its files, grid and local workspace."""
        plant = self.get(plant_id=plant_id, user_email=user_email)
        if plant is None:
            return False
        if plant.get("defaultLibraryId") is not None:
            raise RuntimeError("Temporary default plants are managed by the simulation")
        if plant.get("status") in {
            RunStatus.PENDING.value,
            RunStatus.RUNNING.value,
        }:
            raise RuntimeError("A running plant generation cannot be deleted")

        # Remove GridFS binaries before deleting the metadata that references them.
        for field in ("obj_file_id", "mtl_file_id"):
            file_id = plant.get(field)
            if file_id is not None and self.gridfs.exists(file_id):
                self.gridfs.delete(file_id)

        plant_profile_grid_service.dao.delete_by_plant_id(plant_id=plant_id)
        result = self.dao.delete_by_id_and_user_email(plant_id, user_email)
        if result.deleted_count == 0:
            return False

        # Resolve and validate the path before recursive removal.
        workspace = (WORKSPACE_DIR / "plants" / plant_id).resolve()
        plants_root = (WORKSPACE_DIR / "plants").resolve()
        if workspace.parent != plants_root:
            raise RuntimeError("Invalid plant workspace path")
        if workspace.exists():
            shutil.rmtree(workspace)
        return True

plant_service = PlantService()


def launch_plant_generation(**kwargs: Any) -> None:
    """Keep the router's public entry point while delegating process startup."""
    # Imported lazily to avoid a circular import with the spawned worker.
    from cosimulator.services.plant_generation_launcher import (
        launch_plant_generation as launch,
    )

    launch(**kwargs)
