from collections import Counter
from types import SimpleNamespace

import pytest
from pydantic import ValidationError

from cosimulator.idf.idf_file_operations import load_input_idf, set_energyplus_idd
from cosimulator.idf.thermostat.thermostat import ThermostatConfigurator
from cosimulator.schemas.simulation import SimulationContext, ThermostatSetpoints


def snapshot(idf):
    return {kind: Counter(str(obj) for obj in objects) for kind, objects in idf.idfobjects.items()}


def test_legacy_requests_and_default_temperatures_preserve_entire_idf():
    set_energyplus_idd()
    idf = load_input_idf()
    before = snapshot(idf)
    legacy = SimulationContext(city="andravida", construction_set="test")
    ThermostatConfigurator()(idf, legacy)
    assert snapshot(idf) == before
    legacy.thermostat_setpoints = ThermostatSetpoints(heating_setpoint_c=21, cooling_setpoint_c=24)
    ThermostatConfigurator()(idf, legacy)
    assert snapshot(idf) == before


@pytest.mark.parametrize("heating,cooling", [(20, 26), (21, 25), (21, 30), (15, 24)])
def test_only_occupied_temperatures_change_on_real_template(heating, cooling):
    set_energyplus_idd()
    expected = load_input_idf()
    actual = load_input_idf()
    expected.getobject("SCHEDULE:DAY:INTERVAL", "Schedule Day 4").Value_Until_Time_2 = heating
    expected.getobject("SCHEDULE:DAY:INTERVAL", "Schedule Day 1").Value_Until_Time_2 = cooling
    settings = ThermostatSetpoints(heating_setpoint_c=heating, cooling_setpoint_c=cooling)
    context = SimpleNamespace(thermostat_setpoints=settings)
    ThermostatConfigurator()(actual, context)
    assert snapshot(actual) == snapshot(expected)
    # Reapplying the same settings preserves the configured model.
    ThermostatConfigurator()(actual, context)
    assert snapshot(actual) == snapshot(expected)


@pytest.mark.parametrize("heating,cooling", [
    (26, 25), (24, 24), (14.9, 24), (21, 30.1),
    (float("nan"), 24), (21, float("inf")),
])
def test_invalid_temperature_pairs_are_rejected(heating, cooling):
    with pytest.raises(ValidationError):
        ThermostatSetpoints(heating_setpoint_c=heating, cooling_setpoint_c=cooling)


def test_missing_thermostat_reference_fails_before_any_schedule_edit():
    set_energyplus_idd()
    idf = load_input_idf()
    dual = idf.getobject("THERMOSTATSETPOINT:DUALSETPOINT", "TZ1_OfficeL Dual Setpoint")
    dual.Cooling_Setpoint_Temperature_Schedule_Name = "missing cooling schedule"
    before = snapshot(idf)
    context = SimpleNamespace(thermostat_setpoints=ThermostatSetpoints(
        heating_setpoint_c=20, cooling_setpoint_c=26))
    with pytest.raises(ValueError, match="missing thermostat schedule"):
        ThermostatConfigurator()(idf, context)
    assert snapshot(idf) == before
