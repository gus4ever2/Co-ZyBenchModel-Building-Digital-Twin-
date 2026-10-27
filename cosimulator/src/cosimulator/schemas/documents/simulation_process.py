"""MongoDB document shape for one requested simulation."""

from typing import Any

from cosimulator.enums.run_status import RunStatus
from cosimulator.schemas.simulation.context import SimulationContext


def build_base_process_document(
    user_email: str,
    parameters: SimulationContext,
) -> dict[str, Any]:
    """Create the PENDING process document before the worker is spawned."""
    return {
        "user_email": user_email,
        "status": RunStatus.PENDING.value,
        "start_time": None,
        "end_time": None,
        "progress": 0,
        "parameters": parameters.model_dump(),
        "error": None,
    }
