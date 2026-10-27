"""Select registered case studies and place their callbacks in one registry."""

from eppy.modeleditor import IDF

from cosimulator.schemas.simulation_context import SimulationContext
from cosimulator.simulation.registry import CASE_STUDY_PREPARERS, SimulationRegistry


def prepare_simulation(*, idf: IDF, context: SimulationContext, zone_names: set[str]) -> SimulationRegistry:
    """Prepare only the case studies enabled in this simulation context."""
    registry = SimulationRegistry()  # Remains empty when no option is enabled.
    for prepare_case_study in CASE_STUDY_PREPARERS:
        # A preparer returns None when its option is disabled in the context.
        callbacks = prepare_case_study(
            idf=idf,
            context=context,
            zone_names=zone_names,
        )
        if callbacks is None:
            continue
        # The first callback changes E+ state; the second returns Mongo data.
        start_timestep, end_timestep = callbacks
        registry.start_timestep_callbacks.append(start_timestep)
        registry.end_timestep_callbacks.append(end_timestep)
    return registry
