"""Persistence boundary between the EnergyPlus runner and MongoDB services."""

from cosimulator.simulation.persistence.timestep_persistence import save_timestep

# The runner uses this narrow function rather than importing Mongo services.
__all__ = ["save_timestep"]
