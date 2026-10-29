import unittest
from unittest.mock import patch
from fastapi import FastAPI
from fastapi.testclient import TestClient
from cosimulator.api.routes import analytics as api


class AnalyticsApiTests(unittest.TestCase):
    def setUp(self):
        app = FastAPI()
        app.include_router(api.analytics_router)
        self.client = TestClient(app)

    def tearDown(self):
        self.client.close()

    def test_available_schemas_and_missing_owner(self):
        response = self.client.get("/simulations/analytics/available")
        self.assertEqual(response.status_code, 200)
        self.assertIn("energy", [item["id"] for item in response.json()["analytics"]])
        with patch.object(api.analytics_service, "_assert_owned", side_effect=api.SimulationNotFoundError("Simulation not found")):
            response = self.client.get("/simulations/0123456789abcdef01234567/analytics?user_email=owner@example.com")
            self.assertEqual(response.status_code, 404)

    def test_empty_data_null_through_http(self):
        with patch.object(api.analytics_service, "_timesteps") as cursor:
            cursor.return_value.__enter__.return_value.__iter__.return_value = iter([])
            response = self.client.get("/simulations/0123456789abcdef01234567/analytics?user_email=owner@example.com")
            self.assertEqual(response.status_code, 200)
            self.assertIsNone(response.json()["metrics"]["averageCo2Ppm"])
            self.assertIsNone(response.json()["metrics"]["totalHvacKwh"])

    def test_unknown_selection_is_validation_error(self):
        response = self.client.post("/simulations/0123456789abcdef01234567/analytics?user_email=owner@example.com",
                                    json={"selected": ["unknown"]})
        self.assertEqual(response.status_code, 422)

    def test_comparison_json_contract_and_metrics(self):
        from test_analytics import step

        class Rows:
            def __init__(self, documents): self.documents = documents
            def __enter__(self): return self
            def __exit__(self, *args): pass
            def __iter__(self): return iter(self.documents)

        first, second = "0123456789abcdef01234567", "0123456789abcdef01234568"
        with patch.object(api.analytics_service, "_timesteps", side_effect=lambda key, *args:
                          Rows([step(co2=600 if key == first else 500)])):
            response = self.client.post("/simulations/analytics/comparison", json={
                "user_email": "owner@example.com", "simulationIds": [first, second],
                "references": [{"id": first, "name": "Baseline"}, {"id": second, "name": "Scenario"}]})
            self.assertEqual(response.status_code, 200, response.text)
            data = response.json()
            self.assertEqual(data["baseline"]["name"], "Baseline")
            self.assertEqual(data["comparisons"][0]["thermalZones"][0]["summary"]["meanDeltaCo2Ppm"], -100)
            self.assertEqual(data["analyticsBySimulation"][second]["metrics"]["totalHvacKwhDelta"], 0)


if __name__ == "__main__":
    unittest.main()
