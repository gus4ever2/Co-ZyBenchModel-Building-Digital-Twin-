from types import SimpleNamespace
from cosimulator.idf.idf_file_operations import load_input_idf, set_energyplus_idd

from cosimulator.idf.construction_set.utils.remove_unused_constructions_and_materials import (
    remove_unused_constructions_and_materials,
)


class FakeIdf:
    def __init__(self):
        self.idfobjects = {
            "BUILDINGSURFACE:DETAILED": [SimpleNamespace(fieldvalues=["surface", "Old Wall"])],
            "OTHER:OBJECT": [SimpleNamespace(fieldvalues=["object", "Referenced Window"])],
            "CONSTRUCTION": [
                SimpleNamespace(Name="Old Wall", fieldvalues=["Old Wall", "Old Brick"]),
                SimpleNamespace(Name="Unused Wall", fieldvalues=["Unused Wall", "Unused Brick"]),
                SimpleNamespace(Name="Referenced Window", fieldvalues=["Referenced Window", "Glass"]),
            ],
            "MATERIAL": [
                SimpleNamespace(Name="Old Brick", fieldvalues=["Old Brick"]),
                SimpleNamespace(Name="Unused Brick", fieldvalues=["Unused Brick"]),
                SimpleNamespace(Name="Glass", fieldvalues=["Glass"]),
            ],
        }

    def removeidfobject(self, obj):
        for objects in self.idfobjects.values():
            if obj in objects:
                objects.remove(obj)
                return


def test_cleanup_keeps_all_referenced_constructions_and_their_materials():
    idf = FakeIdf()
    remove_unused_constructions_and_materials(idf)
    assert {obj.Name for obj in idf.idfobjects["CONSTRUCTION"]} == {"Old Wall", "Referenced Window"}
    assert {obj.Name for obj in idf.idfobjects["MATERIAL"]} == {"Old Brick", "Glass"}


def test_cleanup_preserves_existing_building_surface_constructions():
    set_energyplus_idd()
    idf = load_input_idf()
    surface_types = ("BUILDINGSURFACE:DETAILED", "FENESTRATIONSURFACE:DETAILED")
    before = {str(surface.Construction_Name).strip().casefold()
              for kind in surface_types for surface in idf.idfobjects[kind]
              if str(surface.Construction_Name).strip()}
    remove_unused_constructions_and_materials(idf)
    remaining = {str(obj.Name).strip().casefold()
                 for kind, objects in idf.idfobjects.items()
                 if kind.upper() == "CONSTRUCTION" or kind.upper().startswith("CONSTRUCTION:")
                 for obj in objects if hasattr(obj, "Name")}
    assert before <= remaining
