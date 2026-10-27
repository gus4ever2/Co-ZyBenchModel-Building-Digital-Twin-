"""Compatibility exports; geometry logic is shared with IDF preparation.

The simulation package reads the same wall-area calculation used while plant
equipment is inserted into the IDF, preventing two competing area formulas.
"""
from cosimulator.idf.utils.wall_area import (
    available_wall_area_by_zone,
    calculate_green_wall_area_by_zone,
)

# Keep this import path stable for plant runtime callers during the refactor.
__all__ = ["available_wall_area_by_zone", "calculate_green_wall_area_by_zone"]
