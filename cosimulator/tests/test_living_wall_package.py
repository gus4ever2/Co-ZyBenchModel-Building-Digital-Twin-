"""Integration checks for the living-wall package and existing EnergyPlus IDF."""
from io import StringIO
from types import SimpleNamespace
from unittest.mock import patch

from eppy.modeleditor import IDF
import pytest

from cosimulator.idf.idf_file_operations import load_input_idf, set_energyplus_idd
from cosimulator.idf.living_wall.configurator import LivingWallConfigurator
from cosimulator.idf.living_wall.geometry import calculate_green_wall_area_by_zone
from cosimulator.idf.living_wall.plant_co2 import PlantCO2Configurator
from cosimulator.idf.living_wall.schedules import PREFIX
from cosimulator.idf.registry import IDF_CONFIGURATORS
from cosimulator.idf.schedule_definitions import schedule_definitions
from cosimulator.idf.utils.find_every_thermal_zone_name import find_every_thermal_zone_name
from cosimulator.schemas.simulation_context import PlantSimulation


@pytest.mark.parametrize("size", ["medium", "very_small"])
def test_package_builds_native_walls_and_independent_co2_on_real_idf(size):
    set_energyplus_idd()
    idf = load_input_idf()
    schedule_definitions(idf)
    zones = find_every_thermal_zone_name(idf=idf)
    settings = PlantSimulation(plant_id="test", plant_name="Spathiphyllum",
                               green_wall_size=size, lighting_level="high")
    context = SimpleNamespace(plant_simulation=settings)
    profile = {"schema_version": 5, "total_leaf_area_m2": 0.9322176869513541,
               "panel_area_m2": 1.0}
    expected = calculate_green_wall_area_by_zone(
        idf=idf, green_wall_size=settings.green_wall_size, idf_zone_names=zones)
    with patch("cosimulator.services.plant_profile_grid_service.plant_profile_grid_service.get",
               return_value=profile):
        for _ in range(2):
            PlantCO2Configurator()(idf, context)
            LivingWallConfigurator()(idf, context)
    # Reparse the serialized IDF using the installed EnergyPlus 26.1 IDD.
    actual = IDF(StringIO(idf.idfstr()))
    masses = {obj.Name: obj for obj in actual.idfobjects["INTERNALMASS"]
              if obj.Name.startswith(PREFIX)}
    walls = [obj for obj in actual.idfobjects["INDOORLIVINGWALL"]
             if obj.Name.startswith(PREFIX)]
    assert len(walls) == len(masses) == sum(area > 0 for area in expected.values())
    for wall in walls:
        mass = masses[wall.Surface_Name]
        assert mass.Construction_Name == "Interior Partition"
        assert abs(mass.Surface_Area - expected[mass.Zone_or_ZoneList_Name]) < 1e-6
        assert wall.LED_Nominal_Intensity == 200
    assert not any(obj.Name.startswith(PREFIX) for obj in actual.idfobjects["OTHEREQUIPMENT"])
    exchanges = actual.idfobjects["ZONECONTAMINANTSOURCEANDSINK:CARBONDIOXIDE"]
    for zone in zones:
        pair = [obj for obj in exchanges if obj.Name in {f"{zone} CO2 Sink", f"{zone} CO2 Source"}]
        assert len(pair) == 2
        assert {obj.Design_Generation_Rate for obj in pair} == {-1.0, 1.0}


def test_wall_configurator_keeps_construction_order():
    names = [type(step).__name__ for step in IDF_CONFIGURATORS]
    assert names.index("PlantCO2Configurator") < names.index("CO2ControlConfigurator")
    assert names.index("ConstructionSetConfigurator") < names.index("LivingWallConfigurator")
    assert names.index("LivingWallConfigurator") < names.index("ConstructionSetCleanupConfigurator")


def test_no_plant_does_not_load_grid_or_add_wall_objects():
    with patch("cosimulator.services.plant_profile_grid_service.plant_profile_grid_service.get") as get_grid:
        LivingWallConfigurator()(None, SimpleNamespace(plant_simulation=None))
    get_grid.assert_not_called()
