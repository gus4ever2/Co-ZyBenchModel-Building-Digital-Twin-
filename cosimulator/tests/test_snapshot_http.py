import importlib
import sys
import types

from fastapi import FastAPI
from fastapi.testclient import TestClient


def test_start_handler_accepts_and_passes_the_snapshot(monkeypatch, request):
    # The HTTP contract does not need to load the native EnergyPlus runtime.
    fake_service = types.ModuleType("cosimulator.services.simulation_service")
    fake_service.prepare_simulation = lambda **_: "simulation-id"
    fake_service.stop_simulation = lambda **_: True
    monkeypatch.setitem(sys.modules, "cosimulator.services.simulation_service", fake_service)
    fake_timesteps = types.ModuleType("cosimulator.database.dao.simulation_timestep_dao")
    fake_timesteps.simulation_timestep_dao = object()
    monkeypatch.setitem(sys.modules, "cosimulator.database.dao.simulation_timestep_dao", fake_timesteps)
    module_name = "cosimulator.api.routes.simulations"
    if module_name not in sys.modules:
        request.addfinalizer(lambda: sys.modules.pop(module_name, None))
    routes = importlib.import_module(module_name)
    captured = {}

    def prepare(**kwargs):
        captured.update(kwargs)
        return "simulation-id"

    monkeypatch.setattr(routes, "prepare_simulation", prepare)
    request_data = {
        "user_email": "user@example.com",
        "simulation_context": {"city": "Paris", "construction_set": "Set"},
        "construction_set_snapshot": {
            "constructionSet": {"id": "s1", "name": "Set", "type": "construction_set", "properties": {}},
            "constructions": [],
            "materials": [],
        },
    }
    app = FastAPI()
    app.include_router(routes.simulations_router)
    with TestClient(app) as client:
        response = client.post("/simulations/start-simulation", json=request_data)
        without_snapshot = client.post("/simulations/start-simulation", json={
            "user_email": request_data["user_email"],
            "simulation_context": request_data["simulation_context"],
        })
    assert response.status_code == 201
    assert response.json() == {"simulation_id": "simulation-id"}
    assert without_snapshot.status_code == 422
    assert captured["construction_set_snapshot"]["constructionSet"]["id"] == "s1"
