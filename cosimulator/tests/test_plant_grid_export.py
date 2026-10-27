from datetime import datetime, timezone
from unittest.mock import patch

from bson import ObjectId
from fastapi import FastAPI
from fastapi.testclient import TestClient

from cosimulator.api.routes import plants


def test_grid_export_requires_owner_and_returns_full_grid():
    app = FastAPI()
    app.include_router(plants.plants_router)
    plant_id = "0123456789abcdef01234567"
    grid = {"_id": ObjectId(), "recorded_at": datetime.now(timezone.utc), "values": [1, 2]}
    with TestClient(app) as client, patch.object(plants.plant_service, "get") as owner, patch.object(
        plants.plant_profile_grid_service, "get"
    ) as get_grid:
        owner.return_value = {"_id": ObjectId(plant_id)}
        get_grid.return_value = grid
        response = client.get(f"/plants/{plant_id}/export", params={"user_email": "owner@example.com"})
        assert response.status_code == 200
        assert response.json()["plant"]["_id"] == plant_id
        assert response.json()["grid"]["values"] == [1, 2]
        assert response.json()["grid"]["_id"] == str(grid["_id"])
        owner.assert_called_with(plant_id=plant_id, user_email="owner@example.com")

        owner.return_value = None
        get_grid.reset_mock()
        response = client.get(f"/plants/{plant_id}/export", params={"user_email": "other@example.com"})
        assert response.status_code == 404
        get_grid.assert_not_called()

        owner.return_value = {"_id": ObjectId(plant_id)}
        get_grid.return_value = None
        response = client.get(f"/plants/{plant_id}/export", params={"user_email": "owner@example.com"})
        assert response.status_code == 404
