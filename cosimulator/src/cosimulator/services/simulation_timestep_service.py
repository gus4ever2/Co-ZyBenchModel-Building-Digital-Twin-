from datetime import datetime
from typing import Any, Mapping
from pymongo.results import DeleteResult
from cosimulator.database.dao.simulation_timestep_dao import simulation_timestep_dao
from cosimulator.schemas.documents.simulation_timestep import (
    build_base_timestep_document,
)
from cosimulator.simulation_variables.schemas.results import SimulationTimestepResult


class SimulationTimestepService:
    """Own durable timestep documents after every EnergyPlus reporting phase."""

    def __init__(self, dao=simulation_timestep_dao):
        self.dao = dao  # Injectable in tests; production uses the MongoDB DAO.

    def find_results_by_simulation_id(
            self,
            *,
            user_email: str,
            simulation_id: str,
            offset: int = 0,
            limit: int = 1000,
    ) -> tuple[list[dict[str, Any]], int]:
        # Legacy cursor-based helper retained for callers that need a raw DAO
        # cursor shape rather than the normalized paginated method below.
        query = {
            "user_email": user_email,
            "simulation_id": simulation_id,
        }

        #total = self.dao.count_documents(query)

        cursor = (
            self.dao
            .find(
                query)
            .skip(offset)
        )
        # .limit(limit)
        return list(cursor)

    def save_timestep(
            self,
            *,
            user_email: str,
            simulation_id: str,
            timestep_number: int,
            simulation_timestamp: datetime,
            result: SimulationTimestepResult,
            case_study_fragments: Mapping[str, Any] | None = None,
    ) -> str:
        if timestep_number < 0:  # MongoDB sequence numbers start at one.
            raise ValueError(
                "timestep_number cannot be negative"
            )

        # The builder serializes dataclasses and merges case-study fragments.
        document = build_base_timestep_document(
            user_email=user_email,
            simulation_id=simulation_id,
            timestep_number=timestep_number,
            simulation_timestamp=simulation_timestamp,
            simulation_timestep_result=result,
            case_study_fragments=case_study_fragments,
        )

        return self.dao.create(document)

    def get_timestep(
            self,
            *,
            user_email: str,
            simulation_id: str,
            timestep_number: int,
    ) -> dict[str, Any] | None:
        return self.dao.find_by_simulation_and_number(
            user_email=user_email,
            simulation_id=simulation_id,
            timestep_number=timestep_number,
        )

    def get_next_timestep(
            self,
            *,
            user_email: str,
            simulation_id: str,
            current_timestep_number: int,
    ) -> dict[str, Any] | None:
        return self.dao.find_next(
            user_email=user_email,
            simulation_id=simulation_id,
            current_timestep_number=current_timestep_number,
        )

    def get_previous_timestep(
            self,
            *,
            user_email: str,
            simulation_id: str,
            current_timestep_number: int,
    ) -> dict[str, Any] | None:
        return self.dao.find_previous(
            user_email=user_email,
            simulation_id=simulation_id,
            current_timestep_number=current_timestep_number,
        )

    def get_all_timesteps(
            self,
            *,
            user_email: str,
            simulation_id: str,
            limit: int | None = None,
            offset: int = 0,
    ) -> list[dict[str, Any]]:
        normalized_limit = None if limit is None else max(1, limit)
        normalized_offset = max(0, offset)  # Negative pages have no meaning.

        return self.dao.find_all_by_simulation(
            user_email=user_email,
            simulation_id=simulation_id,
            limit=normalized_limit,
            offset=normalized_offset,
        )

    def delete_all_timesteps(
            self,
            *,
            user_email: str,
            simulation_id: str,
    ) -> int:
        # Used when a simulation is deleted or intentionally reset.
        result: DeleteResult = self.dao.delete_all_by_simulation(
            user_email=user_email,
            simulation_id=simulation_id,
        )

        return result.deleted_count


simulation_timestep_service = SimulationTimestepService()
