"""Ordered IDF configuration steps for each simulation."""
from cosimulator.idf.airflow.airflow_network import AirflowNetworkConfigurator
from cosimulator.idf.idf_configurator import IdfConfigurator
from cosimulator.idf.thermostat.thermostat import ThermostatConfigurator
from cosimulator.idf.weather.weather import WeatherConfigurator
from cosimulator.idf.schedule_definitions.schedule_definitions import ScheduleDefinitionsConfigurator
from cosimulator.idf.co2_control.co2_balance import CO2BalanceConfigurator
from cosimulator.idf.co2_control.co2_control import CO2ControlConfigurator
from cosimulator.idf.living_wall.plant_co2 import PlantCO2Configurator
from cosimulator.idf.output.output_variables import OutputVariablesConfigurator
from cosimulator.idf.construction_set.construction_set import ConstructionSetConfigurator
from cosimulator.idf.construction_set.cleanup_construction_set import ConstructionSetCleanupConfigurator
from cosimulator.idf.living_wall.configurator import LivingWallConfigurator


IDF_CONFIGURATORS: tuple[IdfConfigurator, ...] = (
    WeatherConfigurator(),  # Load site location and design days for the chosen city.
    ScheduleDefinitionsConfigurator(),  # Ensure shared schedule type limits exist before they are referenced.
    ThermostatConfigurator(),  # Change occupied temperatures while keeping schedule times and setbacks.
    CO2BalanceConfigurator(),  # Enable the zone CO2 balance and outdoor CO2 schedule.
    PlantCO2Configurator(),  # Add plant CO2 sources only when a plant is selected.
    CO2ControlConfigurator(),  # Configure demand-controlled ventilation when requested.
    AirflowNetworkConfigurator(),  # Create network control, cracks, openings and eligible zones.
    OutputVariablesConfigurator(),  # Request the variables consumed by the simulation.
    ConstructionSetConfigurator(),  # Insert the snapshot objects and assign the selected constructions.
    LivingWallConfigurator(),  # Add native per-zone IndoorLivingWall objects when a plant is selected.
    ConstructionSetCleanupConfigurator(),  # Remove unreferenced definitions after all references are in place.
)
