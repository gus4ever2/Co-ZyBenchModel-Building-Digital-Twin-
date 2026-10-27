"""Persist one completed EnergyPlus timestep through the MongoDB service."""

from datetime import datetime

from cosimulator.services.simulation_timestep_service import (
    simulation_timestep_service,
)
from cosimulator.simulation.case_study.timestep_result import (
    CaseStudyTimestepResult,
)
from cosimulator.simulation_variables.schemas.results import SimulationTimestepResult


def save_timestep(
    *,
    user_email: str,
    simulation_id: str,
    timestep_number: int,
    simulation_timestamp: datetime,
    timestep_result: SimulationTimestepResult,
    case_study_results: list[CaseStudyTimestepResult],
) -> str:
    """Store common outputs and validated results returned by case studies."""
    persistence_fields: dict[str, object] = {}
    for case_study_result in case_study_results:
        fields = case_study_result.to_persistence_fields()
        for field_name, field_value in fields.items():
            if field_name in persistence_fields:
                raise ValueError(
                    "Multiple case studies attempted to persist "
                    f"the field '{field_name}'.",
                )
            persistence_fields[field_name] = field_value

    return simulation_timestep_service.save_timestep(
        user_email=user_email,
        simulation_id=simulation_id,
        timestep_number=timestep_number,
        simulation_timestamp=simulation_timestamp,
        result=timestep_result,
        case_study_fragments=persistence_fields,
    )
