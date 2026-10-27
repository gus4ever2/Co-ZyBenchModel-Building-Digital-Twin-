"""Runtime case study for AirflowNetwork window-opening control."""

from ctypes import c_void_p
from dataclasses import dataclass, field
from typing import Callable

from energyplus_api_helpers.import_helper import EPlusAPIHelper
from eppy.modeleditor import IDF

from cosimulator.schemas.simulation_context import (
    OpenWindows,
    SimulationContext,
)
from cosimulator.simulation.case_study.open_windows.apply_window_control import (
    apply_window_control,
)
from cosimulator.simulation.case_study.open_windows.get_window_actuator_handles import (
    get_window_actuator_handles,
)
from cosimulator.simulation.case_study.open_windows.open_windows_timestep_result import (
    OpenWindowsTimestepResult,
    WindowOpeningValue,
    ZoneWindowOpeningValue,
)
from cosimulator.simulation.case_study.open_windows.window_control_models import (
    ZoneWindowActuatorHandles,
)
from cosimulator.simulation_variables.schemas.handles import SimulationHandles
from cosimulator.simulation_variables.schemas.results import SimulationTimestepResult


@dataclass(slots=True)
class OpenWindowsCaseStudy:
    """Own window actuator discovery, control and persisted opening factors."""

    settings: OpenWindows  # CO2 threshold, temperature margin and strategy.
    idf: IDF  # Required to resolve exterior AFN windows by zone.
    actuator_handles_by_zone: dict[str, ZoneWindowActuatorHandles] = field(
        default_factory=dict,
    )
    actuator_handles_initialized: bool = False  # Prevents repeated discovery.

    def start_timestep(
        self,
        *,
        ep: EPlusAPIHelper,
        state: c_void_p,
        simulation_handles: SimulationHandles,
        timestep_result: SimulationTimestepResult,
    ) -> None:
        """Initialize handles once, then apply opening factors for a timestep."""
        if not self.actuator_handles_initialized:
            self.initialize(
                ep=ep,
                state=state,
                simulation_handles=simulation_handles,
            )
        self.apply(
            ep=ep,
            state=state,
            simulation_handles=simulation_handles,
            timestep_result=timestep_result,
        )

    def end_timestep(
        self,
        *,
        timestep_result: SimulationTimestepResult,
    ) -> OpenWindowsTimestepResult:
        """Return the validated window-opening result for this timestep."""
        return self.build_persistence_fragment(timestep_result=timestep_result)

    def initialize(
        self,
        *,
        ep: EPlusAPIHelper,
        state: c_void_p,
        simulation_handles: SimulationHandles,
    ) -> None:
        del simulation_handles
        self.actuator_handles_by_zone = get_window_actuator_handles(
            ep=ep,
            state=state,
            idf=self.idf,
        )
        # A building may have no controllable AFN windows. Mark discovery as
        # complete even then, otherwise every timestep would repeat it.
        self.actuator_handles_initialized = True

    def apply(
        self,
        *,
        ep: EPlusAPIHelper,
        state: c_void_p,
        simulation_handles: SimulationHandles,
        timestep_result: SimulationTimestepResult,
    ) -> None:
        # Store the exact factors sent to EnergyPlus for persistence/analytics.
        timestep_result.window_opening_results = apply_window_control(
            ep=ep,
            state=state,
            simulation_handles=simulation_handles,
            actuator_handles_by_zone=self.actuator_handles_by_zone,
            timestep_result=timestep_result,
            settings=self.settings,
        )

    def build_persistence_fragment(
        self,
        *,
        timestep_result: SimulationTimestepResult,
    ) -> OpenWindowsTimestepResult:
        # Convert runtime dataclasses to the explicit Pydantic persistence
        # model at the boundary between EnergyPlus control and MongoDB.
        return OpenWindowsTimestepResult(
            window_opening_results={
                zone_name: ZoneWindowOpeningValue(
                    zone_name=result.zone_name,
                    window_results=tuple(
                        WindowOpeningValue(
                            window_name=window_result.window_name,
                            opening_factor=window_result.opening_factor,
                        )
                        for window_result in result.window_results
                    ),
                )
                for zone_name, result in (
                    timestep_result.window_opening_results.items()
                )
            },
        )


def prepare_open_windows_case_study(
    *,
    idf: IDF,
    context: SimulationContext,
    zone_names: set[str],
) -> tuple[Callable, Callable] | None:
    """Return window-control callbacks only when the option is enabled."""
    del zone_names
    if context.open_windows is None:
        return None

    # This object keeps window actuator handles for the whole run.
    case_study = OpenWindowsCaseStudy(settings=context.open_windows, idf=idf)
    return case_study.start_timestep, case_study.end_timestep
