"""Runtime case study for plant CO2 exchange and plant thermal loads."""

from ctypes import c_void_p
from dataclasses import dataclass, field
from typing import Callable

from energyplus_api_helpers.import_helper import EPlusAPIHelper
from eppy.modeleditor import IDF

from cosimulator.energyplus_helpers.get_simulation_timestep_result import (
    get_simulation_timestamp,
)
from cosimulator.schemas.simulation_context import (
    PlantSimulation,
    SimulationContext,
)
from cosimulator.simulation.case_study.plant.build_plant_timestep_result import (
    build_plant_timestep_result,
)
from cosimulator.simulation.case_study.plant.apply_plant_control import (
    apply_plant_control,
)
from cosimulator.simulation.case_study.plant.get_plant_actuator_handles import (
    get_plant_actuator_handles,
)
from cosimulator.simulation.case_study.plant.plant_control_models import (
    ZonePlantActuatorHandles,
)
from cosimulator.simulation.case_study.plant.plant_profile_lookup import (
    PlantProfileLookup,
)
from cosimulator.simulation.case_study.plant.plant_timestep_result import (
    PlantTimestepResult,
)
from cosimulator.simulation_variables.schemas.handles import SimulationHandles
from cosimulator.simulation_variables.schemas.results import SimulationTimestepResult


@dataclass(slots=True)
class PlantCaseStudy:
    """Own plant-specific setup, actuator application and MongoDB output."""

    settings: PlantSimulation  # User-selected plant, coverage and lighting.
    profile_lookup: PlantProfileLookup  # MongoDB grid interpolation service.
    green_wall_area_by_zone: dict[str, float]  # Fixed m² wall area per zone.
    zone_names: set[str]  # Zones where the plant IDF objects may exist.
    actuator_handles_by_zone: dict[str, ZonePlantActuatorHandles] = field(
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
        """Apply the plant controller once for the current EnergyPlus step."""
        del simulation_handles  # Required by the common callback signature only.
        self._ensure_actuator_handles(ep=ep, state=state)
        self._apply_plant_control(
            ep=ep,
            state=state,
            timestep_result=timestep_result,
        )

    def end_timestep(
        self,
        *,
        timestep_result: SimulationTimestepResult,
    ) -> PlantTimestepResult:
        """Return the validated plant result for this timestep."""
        return build_plant_timestep_result(timestep_result=timestep_result)

    def _ensure_actuator_handles(
        self,
        *,
        ep: EPlusAPIHelper,
        state: c_void_p,
    ) -> None:
        """Resolve EnergyPlus actuator handles once, after the API is ready."""
        if self.actuator_handles_initialized:
            return

        self.actuator_handles_by_zone = get_plant_actuator_handles(
            ep=ep,
            state=state,
            zone_names=self.zone_names,
        )
        # An empty mapping is valid for a building without plant actuators;
        # remember that discovery already ran so it is not repeated each step.
        self.actuator_handles_initialized = True

    def _apply_plant_control(
        self,
        *,
        ep: EPlusAPIHelper,
        state: c_void_p,
        timestep_result: SimulationTimestepResult,
    ) -> None:
        """Calculate plant response and send its loads to EnergyPlus."""
        # The plant result is retained in the shared snapshot so analytics and
        # persistence see exactly the values applied to EnergyPlus.
        timestep_result.plant_co2_exchange_results = apply_plant_control(
            ep=ep,
            state=state,
            timestamp=get_simulation_timestamp(
                simulation_timestep_result=timestep_result,
            ),
            timestep_result=timestep_result,
            actuator_handles_by_zone=self.actuator_handles_by_zone,
            profile_lookup=self.profile_lookup,
            settings=self.settings,
            green_wall_area_by_zone=self.green_wall_area_by_zone,
        )


def prepare_plant_case_study(
    *,
    idf: IDF,
    context: SimulationContext,
    zone_names: set[str],
) -> tuple[Callable, Callable] | None:
    """Return plant callbacks only when this simulation has plant settings."""
    if context.plant_simulation is None:
        return None

    # Static geometry and the profile lookup are created once per simulation.
    # Local import avoids a circular dependency: the factory constructs this
    # controller, while this module exposes the public preparation callback.
    from cosimulator.simulation.case_study.plant.create_plant_case_study import (
        create_plant_case_study,
    )

    case_study = create_plant_case_study(
        idf=idf,
        city=context.city,
        settings=context.plant_simulation,
        zone_names=zone_names,
    )
    return case_study.start_timestep, case_study.end_timestep
