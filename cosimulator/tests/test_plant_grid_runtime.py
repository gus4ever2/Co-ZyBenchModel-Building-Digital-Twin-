"""Focused tests for the time-independent plant response-grid runtime."""

from __future__ import annotations

from datetime import datetime
from itertools import product
import unittest

from cosimulator.plant.obj_caribu_plantecophys_grid import DEFAULT_GRID_CONFIG, _key as _grid_key
from cosimulator.schemas.simulation_context import (
    GreenWallSize,
    PlantLightingLevel,
    PlantSimulation,
)
from cosimulator.simulation.case_study.plant.calculate_green_wall_area import (
    calculate_green_wall_area_by_zone,
)
from cosimulator.simulation.case_study.plant.apply_plant_control import (
    _effective_ppfd,
    _maximum_sink_flow_m3_s,
)
from cosimulator.simulation.case_study.plant.plant_profile_lookup import PlantProfileLookup


class _InMemoryGridService:
    """Supply a deterministic grid without requiring MongoDB test records."""

    def __init__(self, document: dict) -> None:
        self.document = document

    def get(self, *, plant_id: str) -> dict:
        del plant_id
        return self.document


class _Surface:
    def __init__(
        self,
        *,
        name: str,
        area: float,
        surface_type: str = "Wall",
        zone_name: str = "",
        parent_name: str = "",
    ) -> None:
        self.Name = name
        self.area = area
        self.Surface_Type = surface_type
        self.Zone_Name = zone_name
        self.Building_Surface_Name = parent_name
        for index, point in enumerate(((0, 0, 0), (area, 0, 0), (area, 0, 1), (0, 0, 1)), 1):
            for axis, value in zip("XYZ", point):
                setattr(self, f"Vertex_{index}_{axis}coordinate", value)


class _Idf:
    def __init__(self) -> None:
        self.idfobjects = {
            "BUILDINGSURFACE:DETAILED": [
                _Surface(name="Conference wall", area=90.0, zone_name="Conference"),
                _Surface(name="Office wall", area=40.0, zone_name="Office"),
            ],
            "FENESTRATIONSURFACE:DETAILED": [
                _Surface(name="Conference window", area=10.0, parent_name="Conference wall"),
                _Surface(name="Office window", area=5.0, parent_name="Office wall"),
            ],
        }


def _linear_grid_document() -> dict:
    """Build a function that four-dimensional interpolation reproduces exactly."""
    axes = {
        "ppfd_umol_m2_s": [0.0, 50.0],
        "temperature_c": [15.0, 25.0],
        "relative_humidity_percent": [20.0, 40.0],
        "co2_ppm": [400.0, 500.0],
    }
    profiles: dict = {}
    for ppfd, temperature, humidity, co2 in product(*axes.values()):
        value = ppfd + 2 * temperature + 3 * humidity + 0.1 * co2
        profiles.setdefault(_grid_key(ppfd), {}).setdefault(
            _grid_key(temperature), {}
        ).setdefault(_grid_key(humidity), {})[_grid_key(co2)] = value
    return {"schema_version": 5, "axes": axes, "profiles": profiles}


def _physiology_grid_document() -> dict:
    """Build a schema-v5 grid with independently verifiable response fields."""
    document = _linear_grid_document()
    document["panel_area_m2"] = 1.0
    document["total_leaf_area_m2"] = 2.0
    for ppfd_values in document["profiles"].values():
        for temperature_values in ppfd_values.values():
            for humidity_values in temperature_values.values():
                for co2, co2_value in list(humidity_values.items()):
                    humidity_values[co2] = {
                            "net_co2_exchange_g_per_hour": co2_value,
                            "transpiration_kg_per_hour": co2_value / 1000.0,
                            "leaf_temperature_c": co2_value / 100.0,
                            "stomatal_conductance_mol_m2_s": co2_value / 10_000.0,
                            "latent_heat_flux_w_m2_leaf": co2_value / 10.0,
                            "sensible_heat_flux_w_m2_leaf": -co2_value / 100.0,
                            "incident_shortwave_flux_w_m2_leaf": co2_value / 5.0,
                            "net_radiation_flux_w_m2_leaf": co2_value / 8.0,
                            "longwave_emission_flux_w_m2_leaf": co2_value / 20.0,
                        }
    return document


class PlantGridRuntimeTests(unittest.TestCase):
    def test_default_grid_starts_at_the_300_ppm_indoor_boundary(self) -> None:
        config = DEFAULT_GRID_CONFIG
        point_count = (
            len(config.ppfd_umol_m2_s)
            * len(config.temperature_c.values())
            * len(config.relative_humidity_percent.values())
            * len(config.co2_ppm.values())
        )
        self.assertEqual(point_count, 5_400)
        self.assertEqual(config.ppfd_umol_m2_s, (0.0, 50.0, 100.0, 200.0, 300.0))
        self.assertEqual(
            config.co2_ppm.values(),
            tuple(range(300, 1001, 50)),
        )

    def test_sink_cannot_remove_co2_below_the_300_ppm_floor(self) -> None:
        # 100 m3 at 310 ppm contains only 0.001 m3 of CO2 above the floor.
        self.assertAlmostEqual(
            _maximum_sink_flow_m3_s(
                co2_concentration_ppm=310.0,
                air_volume_m3=100.0,
                zone_timestep_hours=1.0 / 3.0,
            ),
            100.0 * 10.0e-6 / 1200.0,
        )
        self.assertEqual(
            _maximum_sink_flow_m3_s(
                co2_concentration_ppm=300.0,
                air_volume_m3=100.0,
                zone_timestep_hours=1.0 / 3.0,
            ),
            0.0,
        )

    def test_grid_keys_are_safe_for_nested_mongodb_documents(self) -> None:
        self.assertEqual(_grid_key(17.5), "17p5")
        self.assertEqual(_grid_key(-2.5), "m2p5")

    def test_four_dimensional_interpolation_has_no_pressure_input(self) -> None:
        lookup = PlantProfileLookup(
            plant_id="test-plant",
            profile_service=_InMemoryGridService(_linear_grid_document()),
        )
        value = lookup.get_net_co2_exchange_g_per_hour(
            ppfd_umol_m2_s=25.0,
            air_temperature_c=20.0,
            relative_humidity_percent=30.0,
            co2_concentration_ppm=450.0,
        )
        self.assertAlmostEqual(value, 200.0)

    def test_schema_v3_interpolates_all_physiology_fields(self) -> None:
        lookup = PlantProfileLookup(
            plant_id="test-plant",
            profile_service=_InMemoryGridService(_physiology_grid_document()),
        )
        response = lookup.get_response(
            ppfd_umol_m2_s=25.0,
            air_temperature_c=20.0,
            relative_humidity_percent=30.0,
            co2_concentration_ppm=450.0,
        )
        self.assertAlmostEqual(response.net_co2_exchange_g_per_hour, 200.0)
        self.assertAlmostEqual(response.transpiration_kg_per_hour, 0.2)
        self.assertAlmostEqual(response.leaf_temperature_c or 0.0, 2.0)
        self.assertAlmostEqual(
            response.stomatal_conductance_mol_m2_s or 0.0, 0.02
        )
        self.assertAlmostEqual(response.latent_heat_flux_w_m2_leaf, 20.0)
        self.assertAlmostEqual(response.sensible_heat_flux_w_m2_leaf, -2.0)
        self.assertTrue(response.has_thermal_flux_data)

    def test_selected_light_is_used_only_from_0800_until_2200(self) -> None:
        settings = PlantSimulation(
            plant_id="test-plant",
            plant_name="test",
            green_wall_size=GreenWallSize.VERY_LARGE,
            lighting_level=PlantLightingLevel.VERY_HIGH,
        )
        self.assertEqual(
            _effective_ppfd(timestamp=datetime(2026, 1, 1, 7, 59), settings=settings),
            0.0,
        )
        self.assertEqual(
            _effective_ppfd(timestamp=datetime(2026, 1, 1, 8, 0), settings=settings),
            300.0,
        )
        self.assertEqual(
            _effective_ppfd(timestamp=datetime(2026, 1, 1, 21, 59), settings=settings),
            300.0,
        )
        self.assertEqual(
            _effective_ppfd(timestamp=datetime(2026, 1, 1, 22, 0), settings=settings),
            0.0,
        )

    def test_green_wall_size_is_applied_to_each_zones_available_area(self) -> None:
        areas = calculate_green_wall_area_by_zone(
            idf=_Idf(),
            green_wall_size=GreenWallSize.MEDIUM,
            idf_zone_names={"Conference", "Office"},
        )
        self.assertEqual(areas, {"Conference": 24.0, "Office": 10.5})


if __name__ == "__main__":
    unittest.main()
