from datetime import datetime
from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from pydantic import ValidationError

from cosimulator.schemas.simulation.open_windows import OpenWindows, WindowOpeningStrategy
from cosimulator.simulation.case_study.open_windows.apply_window_control import apply_window_control
from cosimulator.simulation.case_study.open_windows.window_control_models import WindowActuatorHandle, ZoneWindowActuatorHandles
from cosimulator.simulation_variables.schemas.handles import SimulationHandles, ZoneHandles
from cosimulator.simulation_variables.schemas.results import SimulationTimestepResult, ZoneResult
from cosimulator.analytics.runner import run


def control(strategy='fixed_percentage', percentage=10, co2=900, indoor=22, outdoor=22):
    settings = OpenWindows(opening_strategy=strategy, opening_percentage=percentage,
                           temperature_margin_c=2, co2_threshold_ppm=800)
    ep = SimpleNamespace(exchange=SimpleNamespace(set_actuator_value=Mock()))
    result = apply_window_control(
        ep=ep, state=None,
        simulation_handles=SimulationHandles(zone_handles={'Office': ZoneHandles(heating_setpoint_c=1, cooling_setpoint_c=2)}),
        actuator_handles_by_zone={'Office': ZoneWindowActuatorHandles(zone_name='Office', window_actuators=(
            WindowActuatorHandle(window_name='Left',handle=11), WindowActuatorHandle(window_name='Right',handle=12)))},
        timestep_result=SimulationTimestepResult(year=2006,month=6,day=1,hour=12,minute=0,
            outdoor_air_temp_c=outdoor,zone_results={'Office': ZoneResult(zone_air_temp_c=indoor,
            co2_concentration_ppm=co2,heating_setpoint_c=21,cooling_setpoint_c=24)}), settings=settings)
    return ep, result['Office']


@pytest.mark.parametrize('percent,factor', [(0,0),(.1,.001),(10,.1),(100,1)])
def test_fixed_percentage_is_converted_once_and_actuates_every_window(percent,factor):
    ep,result=control(percentage=percent)
    assert [window.opening_factor for window in result.window_results]==[factor,factor]
    assert [call.args for call in ep.exchange.set_actuator_value.call_args_list]==[(None,11,factor),(None,12,factor)]


@pytest.mark.parametrize('conditions', [{'co2':799},{'indoor':30},{'outdoor':10}])
def test_fixed_percentage_closes_when_any_condition_fails(conditions):
    _,result=control(**conditions)
    assert all(window.opening_factor==0 for window in result.window_results)


@pytest.mark.parametrize('percent', [None,-.1,100.1,float('nan'),float('inf')])
def test_fixed_percentage_requires_a_finite_value_between_zero_and_one_hundred(percent):
    with pytest.raises(ValidationError):
        OpenWindows(opening_strategy='fixed_percentage', opening_percentage=percent,
                    temperature_margin_c=2,co2_threshold_ppm=800)


def test_linear_and_on_off_control_retain_their_previous_behaviour():
    for strategy,factor in [('linear',.5),('on_off',1)]:
        _,result=control(strategy=strategy,percentage=None,indoor=20,outdoor=22)
        assert all(window.opening_factor==factor for window in result.window_results)


def test_window_table_retains_real_zone_area_and_mean_opening_semantics():
    rows=[]
    for index,factor in enumerate([0,.2]):
        rows.append({'simulation_timestamp':datetime(2006,6,1,8,index*20),'results':{
            'zone_internal_variable_values':{'Office':{'openable_window_area_m2':12.5,'openable_window_count':2}},
            'window_opening_results':{'Office':{'zone_name':'Office','window_results':[
                {'window_name':'Left','opening_factor':factor},{'window_name':'Right','opening_factor':factor}]}}}})
    result=run('case',rows)
    assert result.zones['Office']['openable_window_area_m2']==12.5
    assert result.zones['Office']['meanWindowOpeningPercent']==10
    assert run('old',[{'results':{}}]).zones.get('Office') is None
