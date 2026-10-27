"""Work executed inside the separate EnergyPlus simulation process."""

from cosimulator.core.logger.logging import logger
from cosimulator.schemas.simulation_context import SimulationContext
from cosimulator.services.idf_objects_service import start_idf_preparation
from cosimulator.services.simulation_process_service import simulation_process_service
from cosimulator.simulation.runner.run_simulation import run_simulation


def run_simulation_worker(
    *,
    simulation_id: str,
    user_email: str,
    simulation_context: SimulationContext,
) -> None:
    """Prepare the IDF, run EnergyPlus and persist the final process status."""
    try:
        simulation_process_service.start_process(process_id=simulation_id)
        # The immutable snapshot belongs to this simulation record, rather
        # than to the user-editable construction workspace.
        start_idf_preparation(
            user_email=user_email,
            simulation_id=simulation_id,
            simulation_context=simulation_context,
        )
        timestep_count = run_simulation(
            user_email=user_email,
            simulation_id=simulation_id,
            simulation_context=simulation_context,
        )
        if timestep_count <= 0:
            raise RuntimeError("Simulation produced no timestep results")
        simulation_process_service.end_process(process_id=simulation_id)
        logger.info("Simulation %s completed", simulation_id)
    except Exception as error:
        simulation_process_service.error_in_process(
            process_id=simulation_id,
            error_message=str(error),
        )
        logger.exception("Simulation %s failed", simulation_id)
