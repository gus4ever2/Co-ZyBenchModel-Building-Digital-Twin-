"""Destructive maintenance operations for non-library data."""

from __future__ import annotations

import shutil
from pathlib import Path
from threading import Lock
from typing import Any

import gridfs

from cosimulator.core.logger.logging import logger
from cosimulator.core.paths.project_paths import WORKSPACE_DIR
from cosimulator.database.dao.plant_dao import plant_dao
from cosimulator.database.dao.plant_profile_grid_dao import plant_profile_grid_dao
from cosimulator.database.dao.simulation_dao import simulation_dao
from cosimulator.database.dao.simulation_timestep_dao import simulation_timestep_dao
from cosimulator.services.plant_process_registry import (
    plant_processes,
    remove_plant_process,
)
from cosimulator.services.simulation_process_registry import (
    remove_simulation_process,
    simulation_processes,
)


_cleanup_lock = Lock()


def _stop_process(process: Any) -> None:
    """Terminate a tracked child process, tolerating an already-finished worker."""
    if process is None:
        return
    try:
        if process.is_alive():
            process.terminate()
            process.join(timeout=10)
        if process.is_alive():
            process.kill()
            process.join()
        elif process.exitcode is None:
            process.join(timeout=1)
    except (AttributeError, OSError):
        logger.exception("Could not stop a background process during cleanup")


def _stop_tracked_processes() -> None:
    for simulation_id, process in list(simulation_processes.items()):
        _stop_process(process)
        remove_simulation_process(simulation_id=simulation_id, process=process)
    for plant_id, process in list(plant_processes.items()):
        _stop_process(process)
        remove_plant_process(plant_id=plant_id, process=process)


def _remove_path(path: Path, parent: Path) -> int:
    """Remove one path only when it is a direct child of the expected parent."""
    resolved_parent = parent.resolve()
    resolved = path.resolve()
    if resolved.parent != resolved_parent:
        raise RuntimeError(f"Refusing to remove path outside {resolved_parent}: {resolved}")
    if not resolved.exists():
        return 0
    if resolved.is_dir():
        shutil.rmtree(resolved)
    else:
        resolved.unlink()
    return 1


def _remove_workspaces() -> int:
    """Delete simulation and plant workspaces but keep the workspace roots."""
    root = WORKSPACE_DIR.resolve()
    if not root.exists():
        return 0

    removed = 0
    plants_root = root / "plants"
    if plants_root.exists():
        for child in list(plants_root.iterdir()):
            removed += _remove_path(child, plants_root)

    for child in list(root.iterdir()):
        if child.name == "plants":
            continue
        removed += _remove_path(child, root)
    return removed


def _remove_generated_gridfs_files() -> int:
    """Remove generated plant files while retaining files referenced by plantLibrary."""
    database = plant_dao.database
    protected: set[Any] = set()
    for document in database.get_collection("plantLibrary").find(
        {}, {"obj_file_id": 1, "mtl_file_id": 1}
    ):
        for field in ("obj_file_id", "mtl_file_id"):
            file_id = document.get(field)
            if file_id is not None:
                protected.add(file_id)

    files = gridfs.GridFS(database, collection="plant_models")
    removed = 0
    for stored in files.find():
        if stored._id in protected:
            continue
        files.delete(stored._id)
        removed += 1
    return removed


def purge_user_data() -> dict[str, int]:
    """Purge all non-library records and local files.

    Library collections (``plantLibrary`` and ``buildingLibraryObjects``) and
    the user-account collection are intentionally never touched.
    """
    if not _cleanup_lock.acquire(blocking=False):
        return {"already_running": 1}
    try:
        _stop_tracked_processes()
        deleted_gridfs = _remove_generated_gridfs_files()
        deleted_simulations = simulation_dao.collection.delete_many({}).deleted_count
        deleted_timesteps = simulation_timestep_dao.collection.delete_many({}).deleted_count
        deleted_plants = plant_dao.collection.delete_many({}).deleted_count
        deleted_profiles = plant_profile_grid_dao.collection.delete_many({}).deleted_count
        deleted_workspaces = _remove_workspaces()
        logger.info(
            "Purged user data: simulations=%s timesteps=%s plants=%s profiles=%s "
            "gridfs=%s workspaces=%s",
            deleted_simulations,
            deleted_timesteps,
            deleted_plants,
            deleted_profiles,
            deleted_gridfs,
            deleted_workspaces,
        )
        return {
            "simulations": int(deleted_simulations),
            "timesteps": int(deleted_timesteps),
            "plants": int(deleted_plants),
            "plant_profiles": int(deleted_profiles),
            "gridfs_files": int(deleted_gridfs),
            "workspace_directories": int(deleted_workspaces),
        }
    finally:
        _cleanup_lock.release()
