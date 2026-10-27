from unittest.mock import patch

import pytest
from pydantic import ValidationError

from cosimulator.database.dto.idf_preparation_dto import ConstructionSetSnapshot
from cosimulator.services.idf_objects_service import preparation_from_snapshot, start_idf_preparation
from cosimulator.services.simulation_process_service import SimulationProcessService


def test_snapshot_produces_only_its_own_idf_objects():
    snapshot = {
        "constructionSet": {"id": "s1", "name": "Set", "type": "construction_set",
                            "properties": {"Exterior_Wall": "Wall"}},
        "constructions": [{"id": "c1", "name": "Wall", "type": "CONSTRUCTION",
                           "properties": {"Name": "Wall", "Outside_Layer": "Brick"}}],
        "materials": [{"id": "m1", "name": "Brick", "type": "MATERIAL",
                       "properties": {"Name": "Brick"}}],
    }
    result = preparation_from_snapshot(snapshot)
    assert result.construction_set.properties["Exterior_Wall"] == "Wall"
    assert [item.name for item in result.idf_objects] == ["Brick", "Wall"]


def test_invalid_snapshot_does_not_silently_fall_back():
    with pytest.raises(KeyError):
        preparation_from_snapshot({"materials": [], "constructions": []})


def test_http_snapshot_schema_rejects_missing_objects():
    with pytest.raises(ValidationError):
        ConstructionSetSnapshot.model_validate({"constructionSet": {"name": "Set"}})


def test_snapshot_is_saved_with_simulation_before_launch():
    snapshot = {"constructionSet": {"name": "Set"}}
    service = SimulationProcessService()
    with patch("cosimulator.services.simulation_process_service.build_base_process_document", return_value={}), \
            patch.object(type(service), "dao", new_callable=lambda: property(lambda _: fake_dao)):
        class FakeDao:
            def create(self, document):
                assert document["construction_set_snapshot"] is snapshot
                return "simulation-id"

        fake_dao = FakeDao()
        assert service.initialize_process(user_email="user@example.com", parameters=None,
                                          construction_set_snapshot=snapshot) == "simulation-id"


def test_preparation_uses_snapshot_not_live_workspace():
    snapshot = {
        "constructionSet": {"name": "Set", "type": "construction_set", "properties": {}},
        "constructions": [],
        "materials": [],
    }
    with patch("cosimulator.services.idf_objects_service.simulation_dao.find_by_id_and_user_email",
               return_value={"construction_set_snapshot": snapshot}), \
            patch("cosimulator.services.idf_objects_service.build_idf") as build, \
            patch("cosimulator.services.idf_objects_service._archive_construction_set"):
        start_idf_preparation(user_email="user@example.com", simulation_id="id", simulation_context=None)
        assert build.call_args.kwargs["idf_preparation_dto"].construction_set.name == "Set"


def test_preparation_requires_a_snapshot():
    with patch("cosimulator.services.idf_objects_service.simulation_dao.find_by_id_and_user_email",
               return_value={}):
        with pytest.raises(ValueError, match="missing its construction set snapshot"):
            start_idf_preparation(user_email="user@example.com", simulation_id="id", simulation_context=None)
