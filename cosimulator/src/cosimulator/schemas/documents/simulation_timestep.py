"""MongoDB document shape for one completed EnergyPlus timestep."""

from dataclasses import asdict
from datetime import datetime, timezone
from typing import Any, Mapping

from cosimulator.simulation_variables.schemas.results import SimulationTimestepResult


def build_base_timestep_document(
    *,
    user_email: str,
    simulation_id: str,
    timestep_number: int,
    simulation_timestamp: datetime,
    simulation_timestep_result: SimulationTimestepResult,
    case_study_fragments: Mapping[str, Any] | None = None,
) -> dict[str, Any]:
    """Serialize common outputs and merge fields owned by enabled case studies."""
    serialized_results = asdict(simulation_timestep_result)
    if case_study_fragments is not None:
        serialized_results.update(case_study_fragments)
    return {
        "user_email": user_email,
        "simulation_id": simulation_id,
        "timestep_number": timestep_number,
        "simulation_timestamp": simulation_timestamp,
        "recorded_at": datetime.now(timezone.utc),
        "results": serialized_results,
    }
