"""Prepare and execute one EnergyPlus simulation."""

import os

from energyplus_api_helpers.import_helper import EPlusAPIHelper
from eppy.modeleditor import IDF

from cosimulator.core.logger.logging import logger
from cosimulator.core.paths.project_paths import ENERGYPLUS_HOME, WEATHER_DIR, WORKSPACE_DIR
from cosimulator.idf.idf_file_operations import get_energyplus_idd_file
from cosimulator.idf.utils.find_every_thermal_zone_name import find_every_thermal_zone_name
from cosimulator.idf.utils.wall_area import available_wall_area_by_zone
from cosimulator.idf.utils.openable_window_geometry import (
    openable_window_geometry_by_zone,
)
from cosimulator.schemas.simulation_context import SimulationContext
from cosimulator.simulation.prepare_simulation import prepare_simulation
from cosimulator.simulation.runner.callbacks import SimulationCallbacks
from cosimulator.simulation_variables.variables.requests import request_output_variables
from cosimulator.simulation_variables.variables.zone_air_nodes import find_zone_air_nodes


def run_simulation(
    *,
    user_email: str,
    simulation_id: str,
    simulation_context: SimulationContext,
) -> int:
    """Run one prepared IDF and return its non-warmup timestep count."""
    # EnergyPlus requires its IDD schema before Eppy opens this run's IDF.
    get_energyplus_idd_file()
    ep = EPlusAPIHelper(ENERGYPLUS_HOME).get_api_instance()

    # Every run owns an isolated workspace, so output files never overlap.
    workspace = WORKSPACE_DIR / simulation_id
    idf_path = workspace / "temp.idf"  # IDF prepared by the service layer.
    output_directory = workspace / "energyplus-output"  # Native E+ output.
    output_directory.mkdir(parents=True, exist_ok=True)
    idf = IDF(str(idf_path))

    # These names constrain output requests and optional case studies to the
    # actual zones and HVAC objects in the current building.
    zone_names = find_every_thermal_zone_name(idf=idf)
    air_loop_names = {
        str(air_loop.Name).strip()
        for air_loop in idf.idfobjects["AIRLOOPHVAC"]
        if str(air_loop.Name).strip()
    }
    zone_air_nodes = find_zone_air_nodes(idf=idf)  # Zone → HVAC node mapping.

    # Select plant/window behavior once, before EnergyPlus calls us back.
    registry = prepare_simulation(
        idf=idf,
        context=simulation_context,
        zone_names=zone_names,
    )
    callbacks = SimulationCallbacks(
        ep=ep,
        user_email=user_email,
        simulation_id=simulation_id,
        zone_names=zone_names,
        air_loop_names=air_loop_names,
        zone_air_nodes=zone_air_nodes,
        registry=registry,
        net_wall_area_by_zone=available_wall_area_by_zone(idf=idf),
        openable_window_geometry_by_zone=openable_window_geometry_by_zone(
            idf=idf,
            zone_names=zone_names,
        ),
    )

    # The opaque state belongs exclusively to this EnergyPlus execution.
    state = ep.state_manager.new_state()
    # Output requests must be registered before EnergyPlus starts.
    request_output_variables(
        ep=ep,
        state=state,
        logger=logger,
        zone_names=zone_names,
        air_loop_names=air_loop_names,
        zone_air_nodes=zone_air_nodes,
    )
    ep.runtime.callback_begin_zone_timestep_after_init_heat_balance(
        state,
        callbacks.begin_zone_timestep,
    )
    ep.runtime.callback_end_zone_timestep_after_zone_reporting(
        state,
        callbacks.end_zone_timestep,
    )

    # The selected city identifies the matching EnergyPlus weather file.
    weather_path = WEATHER_DIR / simulation_context.city / f"{simulation_context.city}.epw"
    # EnergyPlus creates an ``in.idf`` symlink in its current directory.
    # Run from this simulation's writable workspace rather than /app, which
    # is intentionally root-owned in the container.
    previous_cwd = os.getcwd()
    try:
        os.chdir(workspace)
        exit_code = ep.runtime.run_energyplus(
            state,
            [
                "-x", "-a", "-w", str(weather_path), "-d",
                str(output_directory), str(idf_path),
            ],
        )
    finally:
        os.chdir(previous_cwd)
    if exit_code != 0:  # Never report a failed native run as completed.
        raise RuntimeError(f"EnergyPlus failed with exit code {exit_code}")
    if callbacks.timestep_count == 0:  # Detect malformed runs with no output.
        raise RuntimeError("EnergyPlus finished without producing simulation timesteps")
    return callbacks.timestep_count
