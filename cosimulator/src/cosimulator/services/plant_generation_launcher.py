"""Spawn and monitor the background process that creates one plant grid."""

from multiprocessing import get_context
from multiprocessing.process import BaseProcess
from threading import Thread
from typing import Any

from cosimulator.services.plant_process_registry import (
    register_plant_process,
    remove_plant_process,
)


def _generate_plant_process(**kwargs: Any) -> None:
    """Run the CPU-intensive grid calculation inside the spawned process."""
    from cosimulator.services.plant_grid_generation import generate_plant_grid

    generate_plant_grid(**kwargs)


def _remove_finished_plant_process(*, plant_id: str, process: BaseProcess) -> None:
    """Release the local process reference after the child exits."""
    process.join()
    remove_plant_process(plant_id=plant_id, process=process)


def launch_plant_generation(**kwargs: Any) -> None:
    """Start one isolated plant-grid worker and a lightweight monitor thread."""
    plant_id = kwargs["plant_id"]
    process = get_context("spawn").Process(
        target=_generate_plant_process,
        kwargs=kwargs,
        name=f"plant-{plant_id}",
    )
    process.start()
    register_plant_process(plant_id=plant_id, process=process)
    Thread(
        target=_remove_finished_plant_process,
        kwargs={"plant_id": plant_id, "process": process},
        daemon=True,
        name=f"plant-monitor-{plant_id}",
    ).start()
