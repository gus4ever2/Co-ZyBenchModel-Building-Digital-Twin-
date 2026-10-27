from datetime import datetime, timezone
from typing import Any

from cosimulator.database.dao.simulation_dao import simulation_dao
from cosimulator.enums.run_status import RunStatus
from cosimulator.schemas.documents.simulation_process import (
    build_base_process_document,
)
from cosimulator.schemas.simulation_context import SimulationContext


class SimulationProcessService:
    """Persist simulation lifecycle state; it never starts native processes."""

    @property
    def dao(self):
        """DAO for durable simulation-process metadata in MongoDB."""
        return simulation_dao


    def initialize_process(
            self,
            *,
            user_email: str,
            parameters: SimulationContext,
            construction_set_snapshot: dict[str, Any],
    ) -> str:
        # The process record exists before the child worker starts, allowing
        # Spring to show PENDING immediately after the start request.
        document: dict[str, Any] = build_base_process_document(
            user_email=user_email,
            parameters=parameters,
        )
        # Save the immutable input before the worker can start reading it.
        document["construction_set_snapshot"] = construction_set_snapshot
        return self.dao.create(document)  # MongoDB ID used by all later steps.

    def start_process(self, *, process_id: str):
        """Transition a persisted process from PENDING to RUNNING."""
        return self.dao.update_fields(
            process_id,
            {
                "status": RunStatus.RUNNING.value,
                "start_time": datetime.now(timezone.utc),
                "error": None,
            },
        )

    def update_progress(
            self,
            *,
            process_id: str,
            progress: int,
    ):
        """Store a safe 0–100 progress value reported by the EnergyPlus run."""
        normalized_progress = max(0, min(progress, 100))  # Clamp bad input.

        return self.dao.update_fields(
            process_id,
            {
                "progress": normalized_progress,
            },
        )

    def end_process(self, *, process_id: str):
        """Mark a successful run complete and make its progress final."""
        return self.dao.update_fields(
            process_id,
            {
                "status": RunStatus.COMPLETED.value,
                "progress": 100,
                "end_time": datetime.now(timezone.utc),
            },
        )

    def error_in_process(
            self,
            *,
            process_id: str,
            error_message: str,
    ):
        """Persist a failure message produced by the isolated worker."""
        return self.dao.update_fields(
            process_id,
            {
                "status": RunStatus.ERROR.value,
                "error": error_message,
                "end_time": datetime.now(timezone.utc),
            },
        )

    def cancel_process(self, *, process_id: str):
        """Persist cancellation after the local Python process is terminated."""
        return self.dao.update_fields(
            process_id,
            {
                "status": RunStatus.CANCELED.value,
                "end_time": datetime.now(timezone.utc),
            },
        )


    def get_available_simulations(
            self,
            *,
            user_email: str,
    ) -> list[dict]:


        # Ownership is enforced in the DAO query, before documents are shaped.
        cursor = self.dao.find_by_user_email(user_email=user_email)


        simulations = []  # Lightweight summaries, not full snapshots/results.

        for document in cursor:
            parameters = document.get("parameters", {})  # Saved request context.

            simulations.append(
                {
                    "simulation_id": str(document["_id"]),
                    "user_email": document.get("user_email"),
                    "status": document.get("status"),
                    "start_time": document.get("start_time"),
                    "end_time": document.get("end_time"),
                    "progress": document.get("progress", 0),
                    "city": parameters.get("city"),
                    "construction_set": parameters.get(
                        "construction_set"
                    ),
                    "error": document.get("error"),
                }
            )

        return simulations


simulation_process_service = SimulationProcessService()
