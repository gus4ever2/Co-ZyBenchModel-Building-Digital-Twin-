"""Central, explicit list of case studies supported by a simulation."""

from dataclasses import dataclass, field
from typing import Callable

from cosimulator.simulation.case_study.open_windows.open_windows_case_study import (
    prepare_open_windows_case_study,
)
from cosimulator.simulation.case_study.plant.plant_case_study import (
    prepare_plant_case_study,
)
from cosimulator.simulation.case_study.timestep_result import (
    CaseStudyTimestepResult,
)


@dataclass(slots=True)
class SimulationRegistry:
    """Callbacks selected once before EnergyPlus starts."""

    # Applied after common variables are read, before E+ advances the zone.
    start_timestep_callbacks: list[Callable] = field(default_factory=list)
    # Produces optional case-study fields immediately before MongoDB storage.
    end_timestep_callbacks: list[Callable[..., CaseStudyTimestepResult]] = field(
        default_factory=list,
    )


# This is the one explicit extension point for a programmer adding a new use
# case. The preparation service below decides whether each preparer applies to
# the current simulation context.
CASE_STUDY_PREPARERS = (
    prepare_plant_case_study,
    prepare_open_windows_case_study,
)
