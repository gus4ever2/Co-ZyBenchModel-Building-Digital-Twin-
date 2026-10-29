from cosimulator.schemas.simulation import GreenWallSize, PlantSimulation
from cosimulator.idf.living_wall.geometry import calculate_green_wall_area_by_zone
from unittest.mock import patch


def test_five_percent_preset_scales_each_zone_without_changing_other_presets():
    settings = PlantSimulation.model_validate({
        "plant_name": "Spathiphyllum", "green_wall_size": "very_small", "lighting_level": "high",
    })
    assert settings.green_wall_size is GreenWallSize.VERY_SMALL
    assert settings.coverage_percentage is None
    with patch("cosimulator.idf.living_wall.geometry.available_wall_area_by_zone",
               return_value={"Zone A": 100.0, "Zone B": 40.0}):
        areas = calculate_green_wall_area_by_zone(
            idf=None, green_wall_size=settings.green_wall_size,
            idf_zone_names={"Zone A", "Zone B"})
    assert areas == {"Zone A": 5.0, "Zone B": 2.0}
    assert {size.value: size.coverage_ratio for size in GreenWallSize} == {
        "very_small": 0.05, "small": 0.1, "medium": 0.3, "large": 0.5, "very_large": 0.75,
    }
