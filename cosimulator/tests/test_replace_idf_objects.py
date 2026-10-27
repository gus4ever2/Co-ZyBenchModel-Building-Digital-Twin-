from types import SimpleNamespace

from cosimulator.database.dto.idf_preparation_dto import IdfObjectDTO
from cosimulator.idf.construction_set.add_snapshot_objects import _add_idf_object


class FakeIdf:
    def __init__(self):
        self.idfobjects = {
            "CONSTRUCTION": [SimpleNamespace(Name="Wall"), SimpleNamespace(Name="Keep")],
            "CONSTRUCTION:FFACTORGROUNDFLOOR": [SimpleNamespace(Name="Floor")],
            "CONSTRUCTIONPROPERTY:INTERNALHEATSOURCE": [SimpleNamespace(Name="wall")],
        }

    def removeidfobject(self, obj):
        for objects in self.idfobjects.values():
            if obj in objects:
                objects.remove(obj)
                return

    def newidfobject(self, object_type):
        obj = SimpleNamespace(objls=["key", "Name", "Outside_Layer"])
        self.idfobjects[object_type].append(obj)
        return obj


def test_replaces_same_name_construction_across_types_only():
    idf = FakeIdf()
    replacement = IdfObjectDTO(type="CONSTRUCTION", name="floor", properties={
        "Name": "floor", "Outside_Layer": "Concrete",
    })
    _add_idf_object(idf=idf, idf_object=replacement)
    assert [obj.Name for obj in idf.idfobjects["CONSTRUCTION"]] == ["Wall", "Keep", "floor"]
    assert idf.idfobjects["CONSTRUCTION:FFACTORGROUNDFLOOR"] == []
    assert idf.idfobjects["CONSTRUCTIONPROPERTY:INTERNALHEATSOURCE"][0].Name == "wall"
