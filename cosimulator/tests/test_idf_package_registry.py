from types import SimpleNamespace

from cosimulator.idf.airflow.airflow_network import airflow_network
from cosimulator.idf.airflow.add_airflow_cracks import add_airflow_cracks
from cosimulator.idf.airflow.add_open_windows import add_open_windows
from cosimulator.idf.utils.find_every_thermal_zone_name import find_every_thermal_zone_name
from cosimulator.idf.idf_file_operations import load_input_idf, set_energyplus_idd
from cosimulator.idf.schedule_definitions import schedule_definitions
from cosimulator.idf.weather.add_design_days import add_design_days
from cosimulator.idf.co2_control.add_co2_balance import add_co2_balance
from cosimulator.idf.output.add_output_variable_requests import add_output_variables
from cosimulator.idf.registry import IDF_CONFIGURATORS
from cosimulator.idf.construction_set.construction_set import ConstructionSetConfigurator
from cosimulator.idf.co2_control.add_plant_co2_exchange import add_plant_co2_exchange
from cosimulator.idf.co2_control.configure_dcv import configure_co2_dcv
from cosimulator.schemas.simulation_context import SimulationContext
import pytest


def test_airflow_package_matches_existing_configuration():
    set_energyplus_idd()
    expected = load_input_idf()
    actual = load_input_idf()
    zones = find_every_thermal_zone_name(idf=expected)
    add_airflow_cracks(idf=expected)
    add_open_windows(idf=expected, zone_names=zones)
    airflow_network(actual, SimpleNamespace())
    types = ["AIRFLOWNETWORK:SIMULATIONCONTROL", "AIRFLOWNETWORK:MULTIZONE:SURFACE:CRACK",
             "AIRFLOWNETWORK:MULTIZONE:COMPONENT:SIMPLEOPENING", "AIRFLOWNETWORK:MULTIZONE:SURFACE",
             "AIRFLOWNETWORK:MULTIZONE:ZONE"]
    for object_type in types:
        assert sorted(str(obj) for obj in actual.idfobjects[object_type]) == sorted(
            str(obj) for obj in expected.idfobjects[object_type]
        )


def test_schedule_definitions_preserves_existing_fraction():
    set_energyplus_idd()
    idf = load_input_idf()
    schedule_definitions(idf)
    before = [str(item) for item in idf.idfobjects["SCHEDULETYPELIMITS"]]
    schedule_definitions(idf)
    assert [str(item) for item in idf.idfobjects["SCHEDULETYPELIMITS"]] == before
    assert sum(str(item.Name).strip().casefold() == "fraction"
               for item in idf.idfobjects["SCHEDULETYPELIMITS"]) == 1


@pytest.mark.parametrize("plant_enabled,co2_enabled,windows_enabled", [
    (False, False, False), (True, False, False),
    (False, True, True), (True, True, True),
])
def test_registry_preserves_preparation_order_and_idf_objects(
    plant_enabled, co2_enabled, windows_enabled,
):
    set_energyplus_idd()
    expected = load_input_idf()
    actual = load_input_idf()
    context = SimulationContext.model_validate({
        "city": "andravida", "construction_set": "test",
        "plant_simulation": ({"plant_id": "test", "plant_name": "test", "green_wall_size": "medium"}
                             if plant_enabled else None),
        "co2_control": {"setpoint_ppm": 700} if co2_enabled else None,
        "open_windows": {"temperature_margin_c": 1, "co2_threshold_ppm": 700}
                        if windows_enabled else None,
    })
    zones = find_every_thermal_zone_name(idf=expected)
    add_design_days(idf=expected, city=context.city)
    schedule_definitions(expected)
    add_co2_balance(idf=expected)
    if context.plant_simulation is not None:
        add_plant_co2_exchange(idf=expected, zone_names=zones)
    if context.co2_control is not None:
        configure_co2_dcv(idf=expected, zone_names=zones,
                          setpoint_ppm=context.co2_control.setpoint_ppm)
    add_airflow_cracks(idf=expected)
    add_open_windows(idf=expected, zone_names=zones)
    add_output_variables(idf=expected)
    construction_set_index = next(
        index
        for index, configure in enumerate(IDF_CONFIGURATORS)
        if isinstance(configure, ConstructionSetConfigurator)
    )
    for configure in IDF_CONFIGURATORS[:construction_set_index]:
        configure(actual, context)
    assert set(expected.idfobjects) == set(actual.idfobjects)
    for kind in expected.idfobjects:
        assert sorted(str(obj) for obj in expected.idfobjects[kind]) == sorted(
            str(obj) for obj in actual.idfobjects[kind]
        ), kind
