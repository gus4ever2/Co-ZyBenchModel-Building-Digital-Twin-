from cosimulator.simulation_variables.variables.mapper import OUTPUT_VARIABLE_MAPPING
from cosimulator.simulation_variables.variables.variables import OutputVariableKeyType


def test_people_outputs_are_requested_per_thermal_zone() -> None:
    for output_name in (
        "Zone People Occupant Count",
        "Zone People Total Heating Rate",
        "Zone People Total Heating Energy",
    ):
        metadata = OUTPUT_VARIABLE_MAPPING[output_name]
        assert metadata.is_zone_result is True
        assert metadata.key_type is OutputVariableKeyType.ZONE
        assert metadata.key_suffix is None
