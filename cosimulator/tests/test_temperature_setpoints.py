from datetime import datetime

from cosimulator.analytics.runner import run


def test_recorded_setpoints_preserve_zone_schedules_and_missing_temperature():
    rows = [
        {"simulation_timestamp": datetime(2006, 6, 1, 7), "results": {"zone_results": {
            "Office": {"zone_air_temp_c": 22, "heating_setpoint_c": 15, "cooling_setpoint_c": 30},
            "Lobby": {"heating_setpoint_c": 18, "cooling_setpoint_c": 27}}}},
        {"simulation_timestamp": datetime(2006, 6, 1, 9), "results": {"zone_results": {
            "Office": {"zone_air_temp_c": 25, "heating_setpoint_c": 21, "cooling_setpoint_c": 24},
            "Lobby": {"heating_setpoint_c": 18, "cooling_setpoint_c": float("nan")}}}},
        {"simulation_timestamp": datetime(2006, 6, 1, 10), "results": {"zone_results": {
            "Office": {"heating_setpoint_c": 21, "cooling_setpoint_c": 24},
            "Empty": {"heating_setpoint_c": True}}}},
    ]
    result = run("case", rows, ["temperature"]).results["temperature"]
    assert result["setpointsByZone"] == {
        "Office": {"heatingC": [15, 21], "coolingC": [24, 30]},
        "Lobby": {"heatingC": [18], "coolingC": [27]},
        "Empty": {"heatingC": [], "coolingC": []},
    }
    assert result["averageTemperatureC"] == 23.5
    assert result["comfortViolationSteps"] == 1
    assert run("empty", [], ["temperature"]).results["temperature"]["setpointsByZone"] == {}
