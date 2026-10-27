"""Generic EnergyPlus callbacks used by the simulation runner."""

from ctypes import c_void_p
from datetime import datetime

from energyplus_api_helpers.import_helper import EPlusAPIHelper

from cosimulator.core.logger.logging import logger
from cosimulator.energyplus_helpers.api_handles import get_handles
from cosimulator.energyplus_helpers.get_simulation_timestep_result import (
    get_simulation_timestamp,
    get_simulation_timestep_result,
)
from cosimulator.services.simulation_process_service import simulation_process_service
from cosimulator.simulation.persistence import save_timestep
from cosimulator.simulation.registry import SimulationRegistry
from cosimulator.simulation_variables.meters.values import get_meter_values
from cosimulator.simulation_variables.schemas.handles import SimulationHandles
from cosimulator.simulation_variables.schemas.results import (
    SimulationTimestepResult,
)


class SimulationCallbacks:
    """Keep callback state outside the runner and independent of case studies."""

    def __init__(
        self,
        *,
        ep: EPlusAPIHelper,
        user_email: str,
        simulation_id: str,
        zone_names: set[str],
        air_loop_names: set[str],
        zone_air_nodes: dict[str, str],
        registry: SimulationRegistry,
    ) -> None:
        self._ep = ep  # EnergyPlus API instance used by both callbacks.
        self._user_email = user_email  # MongoDB ownership key.
        self._simulation_id = simulation_id  # Workspace, MongoDB and progress key.
        self._zone_names = zone_names  # Requested zone-level output scope.
        self._air_loop_names = air_loop_names  # Requested HVAC output scope.
        self._zone_air_nodes = zone_air_nodes  # Required for supply/return outputs.
        self._registry = registry  # Enabled plant/window behavior for this run.
        self._handles: SimulationHandles | None = None  # Set when E+ is ready.
        self._timestep_result: SimulationTimestepResult | None = None  # Shared snapshot.
        self._timestep_count = 0  # Persisted non-warmup timestep sequence.
        self._last_reported_progress = -1  # Suppresses duplicate SSE updates.

    @property
    def timestep_count(self) -> int:
        return self._timestep_count

    def begin_zone_timestep(self, state: c_void_p) -> None:
        # EnergyPlus may invoke the callback before its variable handles exist.
        if not self._ensure_handles(state=state) or self._ep.exchange.warmup_flag(state):
            return
        if self._handles is None:
            return

        # Read the common variables once; every enabled case study receives
        # this same complete snapshot and may set its own actuators.
        self._timestep_result = get_simulation_timestep_result(
            ep=self._ep,
            state=state,
            zone_names=self._zone_names,
            simulation_handles=self._handles,
        )
        for callback in self._registry.start_timestep_callbacks:
            callback(
                ep=self._ep,
                state=state,
                simulation_handles=self._handles,
                timestep_result=self._timestep_result,
            )

    def end_zone_timestep(self, state: c_void_p) -> None:
        if (
            self._handles is None
            or self._timestep_result is None
            or self._ep.exchange.warmup_flag(state)
        ):
            return
        # Meters are available only after zone reporting, unlike the values
        # read at the beginning of this same timestep.
        self._timestep_result.meter_results = get_meter_values(
            ep=self._ep, state=state, meter_handles=self._handles.meter_handles,
        )
        timestamp = get_simulation_timestamp(
            simulation_timestep_result=self._timestep_result,
        )
        self._update_progress(timestamp=timestamp)
        # Each timestep is persisted immediately. Keeping an annual in-memory
        # copy is unnecessary and grows with every EnergyPlus callback.
        self._timestep_count += 1
        # Each case study returns one validated Pydantic result. The generic
        # persistence boundary converts those results to MongoDB fields.
        case_study_results = [
            callback(timestep_result=self._timestep_result)
            for callback in self._registry.end_timestep_callbacks
        ]
        save_timestep(
            user_email=self._user_email,
            simulation_id=self._simulation_id,
            timestep_number=self._timestep_count,
            simulation_timestamp=timestamp,
            timestep_result=self._timestep_result,
            case_study_results=case_study_results,
        )

    def _ensure_handles(self, *, state: c_void_p) -> bool:
        if self._handles is not None:  # Handles remain valid for the full run.
            return True
        # E+ creates output and actuator handles after early callbacks.
        if not self._ep.exchange.api_data_fully_ready(state):
            return False
        self._handles = get_handles(
            ep=self._ep,
            state=state,
            zone_names=self._zone_names,
            air_loop_names=self._air_loop_names,
            zone_air_nodes=self._zone_air_nodes,
        )
        logger.info(
            "EnergyPlus handles are ready for simulation '%s'.",
            self._simulation_id,
        )
        return True

    def _update_progress(self, *, timestamp: datetime) -> None:
        start = datetime(timestamp.year, 1, 1)  # Start of simulated year.
        end = datetime(timestamp.year + 1, 1, 1)  # Exclusive end of year.
        progress = max(0, min(int((timestamp - start) / (end - start) * 100), 99))
        if progress == self._last_reported_progress:  # One update per percent.
            return
        simulation_process_service.update_progress(
            process_id=self._simulation_id,
            progress=progress,
        )
        self._last_reported_progress = progress
