"""In-memory registry for EnergyPlus processes owned by this API server."""

from multiprocessing.process import BaseProcess


# This cannot live in MongoDB: it stores only live Python Process objects.
simulation_processes: dict[str, BaseProcess] = {}


def register_simulation_process(*, simulation_id: str, process: BaseProcess) -> None:
    """Make a newly started local worker available to cancellation logic."""
    simulation_processes[simulation_id] = process


def get_simulation_process(*, simulation_id: str) -> BaseProcess | None:
    """Return the local process, if this server started and still tracks it."""
    return simulation_processes.get(simulation_id)


def remove_simulation_process(*, simulation_id: str, process: BaseProcess | None = None) -> None:
    """Remove a process without deleting a newer worker under the same key."""
    if process is None or simulation_processes.get(simulation_id) is process:
        simulation_processes.pop(simulation_id, None)
