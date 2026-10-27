"""In-memory registry for local background plant-generation processes."""

from multiprocessing.process import BaseProcess


plant_processes: dict[str, BaseProcess] = {}


def get_plant_process(*, plant_id: str) -> BaseProcess | None:
    """Return the worker currently tracked by this API process."""
    return plant_processes.get(plant_id)


def register_plant_process(*, plant_id: str, process: BaseProcess) -> None:
    """Register a newly started plant-grid worker."""
    plant_processes[plant_id] = process


def remove_plant_process(*, plant_id: str, process: BaseProcess | None = None) -> None:
    """Remove a completed worker without removing a replacement worker."""
    if process is None or plant_processes.get(plant_id) is process:
        plant_processes.pop(plant_id, None)
