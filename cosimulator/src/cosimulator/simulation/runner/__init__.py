"""Public entry point for the EnergyPlus execution lifecycle."""

from cosimulator.simulation.runner.run_simulation import run_simulation

# Only this orchestration function is public; callbacks remain internal.
__all__ = ["run_simulation"]
