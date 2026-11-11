"""MongoDB document shape for one requested simulation."""

from typing import Any

from cosimulator.enums.run_status import RunStatus
from cosimulator.schemas.simulation.context import SimulationContext


def build_base_process_document(
    user_email: str | None,
    guest_session_id: str | None,
    parameters: SimulationContext,
) -> dict[str, Any]:
    """Create the PENDING process document with its resolved owner."""
    return {
        "user_email": user_email,
        "guest_session_id": guest_session_id,
        "status": RunStatus.PENDING.value,
        "start_time": None,
        "end_time": None,
        "progress": 0,
        "parameters": parameters.model_dump(),
        "error": None,
    }
