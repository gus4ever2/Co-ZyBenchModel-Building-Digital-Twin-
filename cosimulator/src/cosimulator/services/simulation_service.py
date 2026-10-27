"""Public orchestration functions for simulation lifecycle and workspace cleanup."""

import shutil
from multiprocessing import get_context
from multiprocessing.process import BaseProcess
from threading import Thread
from typing import Any

from bson import ObjectId

from cosimulator.core.logger.logging import logger
from cosimulator.core.paths.project_paths import WORKSPACE_DIR
from cosimulator.schemas.simulation_context import SimulationContext
from cosimulator.services.simulation_process_registry import (
    get_simulation_process,
    register_simulation_process,
    remove_simulation_process,
)
from cosimulator.services.simulation_process_service import simulation_process_service
from cosimulator.services.simulation_worker import run_simulation_worker
from cosimulator.services.temporary_plant_cleanup import (
    delete_temporary_plant_if_owned,
)


def _remove_finished_process(
    *,
    simulation_id: str,
    process: BaseProcess,
    user_email: str,
    temporary_plant_id: str | None,
) -> None:
    """Wait in a monitor thread, then clean local process-only resources."""
    process.join()
    delete_temporary_plant_if_owned(
        simulation_id=simulation_id,
        user_email=user_email,
        temporary_plant_id=temporary_plant_id,
    )
    remove_simulation_process(simulation_id=simulation_id, process=process)
    logger.info("Simulation process %s removed from registry", simulation_id)


def launch_simulation(
    *,
    simulation_id: str,
    user_email: str,
    simulation_context: SimulationContext,
) -> None:
    """Start one isolated Windows EnergyPlus worker and its monitor thread."""
    process = get_context("spawn").Process(
        target=run_simulation_worker,
        kwargs={
            "simulation_id": simulation_id,
            "user_email": user_email,
            "simulation_context": simulation_context,
        },
        name=f"simulation-{simulation_id}",
        daemon=False,
    )
    process.start()
    register_simulation_process(simulation_id=simulation_id, process=process)

    temporary_plant_id = (
        simulation_context.plant_simulation.plant_id
        if simulation_context.plant_simulation
        else None
    )
    Thread(
        target=_remove_finished_process,
        kwargs={
            "simulation_id": simulation_id,
            "process": process,
            "user_email": user_email,
            "temporary_plant_id": temporary_plant_id,
        },
        name=f"simulation-monitor-{simulation_id}",
        daemon=True,
    ).start()


def stop_simulation(*, simulation_id: str) -> bool:
    """Stop a local worker and mark its persisted process record canceled."""
    process = get_simulation_process(simulation_id=simulation_id)
    if process is None:
        return False
    if not process.is_alive():
        process.join()
        remove_simulation_process(simulation_id=simulation_id, process=process)
        return False

    process.terminate()
    process.join(timeout=10)
    if process.is_alive():
        process.kill()
        process.join()

    remove_simulation_process(simulation_id=simulation_id, process=process)
    simulation_process_service.cancel_process(process_id=simulation_id)
    logger.info("Simulation %s canceled", simulation_id)
    return True


def prepare_simulation(
    *,
    user_email: str,
    simulation_context: SimulationContext,
    construction_set_snapshot: dict[str, Any],
) -> str:
    """Persist immutable inputs first, then launch the separate worker."""
    simulation_id = simulation_process_service.initialize_process(
        user_email=user_email,
        parameters=simulation_context,
        construction_set_snapshot=construction_set_snapshot,
    )
    launch_simulation(
        simulation_id=simulation_id,
        user_email=user_email,
        simulation_context=simulation_context,
    )
    return simulation_id


def delete_simulation_workspace(*, simulation_id: str, user_email: str) -> None:
    """Remove one finished simulation's local files after confirming its owner."""
    if not ObjectId.is_valid(simulation_id):
        raise ValueError("Invalid simulation ID")

    simulation = simulation_process_service.dao.find_by_id_and_user_email(
        document_id=simulation_id,
        user_email=user_email,
    )
    if simulation is None:
        raise LookupError("Simulation was not found for this user")

    if simulation.get("status") in {"PENDING", "STARTING", "RUNNING"}:
        raise RuntimeError("An active simulation cannot be deleted")

    process = get_simulation_process(simulation_id=simulation_id)
    if process is not None and process.is_alive():
        raise RuntimeError("An active simulation cannot be deleted")

    workspace_root = WORKSPACE_DIR.resolve()
    simulation_workspace = (workspace_root / simulation_id).resolve()
    if simulation_workspace.parent != workspace_root:
        raise ValueError("Invalid simulation workspace path")

    if simulation_workspace.exists():
        if not simulation_workspace.is_dir():
            raise RuntimeError("Simulation workspace is not a directory")
        shutil.rmtree(simulation_workspace)
        logger.info("Removed workspace for simulation %s", simulation_id)
