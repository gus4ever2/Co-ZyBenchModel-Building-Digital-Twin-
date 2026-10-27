"""Map EnergyPlus internal-variable names to persisted result fields."""

from .internal_variables import InternalVariable


INTERNAL_VARIABLE_MAPPING: dict[str, InternalVariable] = {
    "Zone Floor Area": InternalVariable(result_field="floor_area_m2"),
    "Zone Air Volume": InternalVariable(result_field="air_volume_m3"),
}
