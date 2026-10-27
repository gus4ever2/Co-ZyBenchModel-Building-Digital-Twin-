"""Native EnergyPlus CO2-based demand-controlled ventilation configuration."""

from cosimulator.idf.co2_control.configure_dcv import configure_co2_dcv  # Public entry point for native CO2-based ventilation control.

__all__ = ["configure_co2_dcv"]  # Explicitly exported package API.
