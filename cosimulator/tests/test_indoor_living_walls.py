import unittest
from types import SimpleNamespace
from collections import defaultdict
from cosimulator.schemas.simulation_context import PlantSimulation
from cosimulator.idf.living_wall.living_wall import add_indoor_living_walls
from cosimulator.idf.living_wall.schedules import PREFIX, LED_INTENSITY_SCHEDULE


class FakeIDF:
    def __init__(self):
        self.idfobjects = defaultdict(list)
        def rectangle(width, height, **fields):
            vertices = ((0, 0, 0), (width, 0, 0), (width, 0, height), (0, 0, height))
            for index, point in enumerate(vertices, 1):
                for axis, value in zip("XYZ", point):
                    fields[f"Vertex_{index}_{axis}coordinate"] = value
            return SimpleNamespace(**fields)
        self.idfobjects["BUILDINGSURFACE:DETAILED"] = [
            rectangle(10, 4, Name="Wall A", Surface_Type="Wall", Zone_Name="A"),
            rectangle(5, 4, Name="Wall B", Surface_Type="Wall", Zone_Name="B")]
        self.idfobjects["FENESTRATIONSURFACE:DETAILED"] = [
            rectangle(5, 2, Building_Surface_Name="Wall A")]
        for zone in ("A", "B"):
            self.idfobjects["ZONEHVAC:EQUIPMENTCONNECTIONS"].append(
                SimpleNamespace(
                    Zone_Name=zone,
                    Zone_Conditioning_Equipment_List_Name=f"{zone} Equipment",
                    Zone_Air_Inlet_Node_or_NodeList_Name=f"{zone} Inlets",
                    Zone_Air_Exhaust_Node_or_NodeList_Name=f"{zone} Exhausts",
                )
            )
            self.idfobjects["ZONEHVAC:EQUIPMENTLIST"].append(
                SimpleNamespace(
                    Name=f"{zone} Equipment",
                    Zone_Equipment_1_Object_Type="ZoneHVAC:AirDistributionUnit",
                    Zone_Equipment_1_Name=f"{zone} Existing Equipment",
                    Zone_Equipment_2_Object_Type="",
                    Zone_Equipment_2_Name="",
                )
            )
            self.idfobjects["NODELIST"].extend(
                (
                    SimpleNamespace(
                        Name=f"{zone} Inlets",
                        Node_1_Name=f"{zone} Supply",
                        Node_2_Name="",
                    ),
                    SimpleNamespace(
                        Name=f"{zone} Exhausts",
                        Node_1_Name=f"{zone} Return",
                        Node_2_Name="",
                    ),
                )
            )

    def newidfobject(self, kind, **fields):
        obj = SimpleNamespace(**fields)
        self.idfobjects[kind].append(obj)
        return obj

    def removeidfobject(self, obj):
        for values in self.idfobjects.values():
            if obj in values:
                values.remove(obj)
                break


class LivingWallTests(unittest.TestCase):
    def setUp(self):
        self.idf = FakeIDF()
        self.idf.newidfobject("CONSTRUCTION", Name="Interior Partition")
        self.settings = PlantSimulation(plant_id="test", plant_name="Test", green_wall_size="medium",
                                        coverage_percentage=40, lighting_level="medium")
        self.profile = {
            "schema_version": 5,
            "total_leaf_area_m2": 1.5,
            "panel_area_m2": 1.0,
        }

    def add(self):
        return add_indoor_living_walls(idf=self.idf, zone_names={"A", "B", "NoWalls"},
                                      settings=self.settings, profile=self.profile)

    def test_native_wall_and_internal_mass_per_covered_zone(self):
        self.add()
        masses = self.idf.idfobjects["INTERNALMASS"]
        walls = self.idf.idfobjects["INDOORLIVINGWALL"]
        self.assertEqual(len(masses), 2)
        self.assertEqual(len(walls), 2)
        # Zone A: (40 gross - 10 opening) * 40%; zone B: 20 * 40%.
        self.assertEqual([mass.Surface_Area for mass in masses], [12.0, 8.0])
        for mass, wall in zip(masses, walls):
            self.assertEqual(mass.Construction_Name, "Interior Partition")
            self.assertEqual(wall.Surface_Name, mass.Name)
            self.assertEqual(wall.Total_Leaf_Area, mass.Surface_Area * 1.5)
            self.assertEqual(wall.Evapotranspiration_Calculation_Method, "Penman-Monteith")
            self.assertEqual(wall.LED_Nominal_Intensity, 100.0)
            self.assertEqual(wall.LED_Nominal_Power, 0.0)
            self.assertEqual(wall.LED_Intensity_Schedule_Name, LED_INTENSITY_SCHEDULE)
        self.assertEqual(self.idf.idfobjects["OTHEREQUIPMENT"], [])

    def test_repeat_no_duplicates_and_zero_coverage(self):
        self.add()
        self.add()
        self.assertEqual(len(self.idf.idfobjects["INTERNALMASS"]), 2)
        self.assertEqual(len(self.idf.idfobjects["INDOORLIVINGWALL"]), 2)
        self.assertEqual(len(self.idf.idfobjects["SCHEDULE:COMPACT"]), 1)
        self.settings.coverage_percentage = 0
        self.add()
        self.assertEqual(self.idf.idfobjects["INTERNALMASS"], [])
        self.assertEqual(self.idf.idfobjects["INDOORLIVINGWALL"], [])
        self.assertEqual(self.idf.idfobjects["SCHEDULE:COMPACT"], [])

    def test_removes_legacy_plant_loads_and_preserves_other_equipment(self):
        self.idf.newidfobject("OTHEREQUIPMENT", Name=PREFIX + "A Plant Latent Load")
        self.idf.newidfobject("OTHEREQUIPMENT", Name=PREFIX + "A Plant Sensible Load")
        self.idf.newidfobject("SCHEDULE:CONSTANT", Name=PREFIX + "A Plant Latent Load")
        existing = self.idf.newidfobject("OTHEREQUIPMENT", Name="Existing appliance")
        self.add()
        self.assertEqual(self.idf.idfobjects["OTHEREQUIPMENT"], [existing])
        self.assertFalse(any("Plant Latent Load" in obj.Name
                             for obj in self.idf.idfobjects["SCHEDULE:CONSTANT"]))

    def test_selectable_stanghellini_and_idempotent_native_outputs(self):
        self.settings.evapotranspiration_method = "Stanghellini"
        self.add()
        self.add()
        walls = self.idf.idfobjects["INDOORLIVINGWALL"]
        self.assertTrue(all(wall.Evapotranspiration_Calculation_Method == "Stanghellini"
                            for wall in walls))
        self.assertEqual(len(self.idf.idfobjects["OUTPUT:VARIABLE"]), 7)
        self.assertTrue(all(obj.Key_Value == "*"
                            for obj in self.idf.idfobjects["OUTPUT:VARIABLE"]))
        self.settings.coverage_percentage = 0
        self.add()
        self.assertEqual(self.idf.idfobjects["OUTPUT:VARIABLE"], [])

    def test_invalid_evapotranspiration_method_is_rejected(self):
        with self.assertRaises(ValueError):
            PlantSimulation(plant_name="Test", green_wall_size="medium",
                            evapotranspiration_method="unsupported")

    def test_missing_backing_construction_is_error(self):
        self.idf.idfobjects["CONSTRUCTION"].clear()
        with self.assertRaisesRegex(ValueError, "Interior Partition"):
            self.add()

    def test_missing_profile_is_error(self):
        self.profile["schema_version"] = 4
        with self.assertRaises(ValueError): self.add()

    def test_context_contains_selections_not_idf_definitions(self):
        self.assertNotIn("living_wall", self.settings.model_dump())
        with self.assertRaises(ValueError):
            PlantSimulation(plant_name="Test", green_wall_size="medium", coverage_percentage=101)


if __name__ == "__main__": unittest.main()
