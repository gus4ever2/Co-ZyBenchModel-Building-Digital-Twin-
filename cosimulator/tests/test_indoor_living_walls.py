import unittest
from types import SimpleNamespace
from collections import defaultdict
from cosimulator.schemas.simulation_context import PlantSimulation
from cosimulator.idf.equipment.plant_loads import add_indoor_living_walls, PREFIX


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

    def test_photosyneb_load_objects(self):
        self.add()
        self.assertEqual(self.idf.idfobjects["INDOORLIVINGWALL"], [])
        loads = self.idf.idfobjects["OTHEREQUIPMENT"]
        self.assertEqual(len(loads), 4)
        self.assertEqual(loads[0].Fuel_Type, "None")
        self.assertEqual(loads[0].Design_Level, 1.0)
        self.assertEqual(loads[0].Fraction_Latent, 1.0)
        self.assertEqual(loads[1].Fraction_Latent, 0.0)
        self.assertEqual(self.idf.idfobjects["ZONEHVAC:IDEALLOADSAIRSYSTEM"], [])
        self.assertEqual(self.idf.idfobjects["METER:CUSTOM"], [])
        self.assertEqual(self.idf.idfobjects["ZONECONTROL:HUMIDISTAT"], [])

    def test_repeat_no_duplicates_and_zero_coverage(self):
        self.add()
        self.add()
        self.assertEqual(len(self.idf.idfobjects["OTHEREQUIPMENT"]), 4)
        self.settings.coverage_percentage = 0
        self.add()
        self.assertEqual(len(self.idf.idfobjects["OTHEREQUIPMENT"]), 0)

    def test_missing_profile_is_error(self):
        self.profile["schema_version"] = 4
        with self.assertRaises(ValueError): self.add()

    def test_context_contains_selections_not_idf_definitions(self):
        self.assertNotIn("living_wall", self.settings.model_dump())
        with self.assertRaises(ValueError):
            PlantSimulation(plant_name="Test", green_wall_size="medium", coverage_percentage=101)


if __name__ == "__main__": unittest.main()
