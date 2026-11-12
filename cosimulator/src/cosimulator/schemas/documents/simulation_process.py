"""MongoDB document shape for one requested simulation."""

from typing import Any

from cosimulator.enums.run_status import RunStatus
from cosimulator.schemas.simulation.context import SimulationContext


def build_base_process_document(
    owner_type: str,
    owner_id: str,
    parameters: SimulationContext,
) -> dict[str, Any]:
    """Create the PENDING process document with its resolved owner."""
    return {
        "owner_type": owner_type,
        "owner_id": owner_id,
        "status": RunStatus.PENDING.value,
        "start_time": None,
        "end_time": None,
        "progress": 0,
        "parameters": parameters.model_dump(),
        "error": None,
    }
