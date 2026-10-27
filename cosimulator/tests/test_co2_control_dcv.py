"""Focused checks for the native EnergyPlus CO2-control configuration."""

from __future__ import annotations

import unittest

from pydantic import ValidationError

from cosimulator.idf.co2_control import configure_co2_dcv
from cosimulator.idf.utils.find_every_thermal_zone_name import (
    find_every_thermal_zone_name,
)
from cosimulator.idf.idf_file_operations import (
    load_input_idf,
    set_energyplus_idd,
)
from cosimulator.schemas.simulation_context import SimulationContext


class Co2ControlContextTests(unittest.TestCase):
    def test_accepts_supported_setpoint(self) -> None:
        context = SimulationContext.model_validate(
            {
                "city": "paris",
                "construction_set": "test",
                "co2_control": {"setpoint_ppm": 800},
            }
        )

        self.assertEqual(context.co2_control.setpoint_ppm, 800)

    def test_accepts_new_intermediate_setpoint(self) -> None:
        context = SimulationContext.model_validate(
            {
                "city": "paris",
                "construction_set": "test",
                "co2_control": {"setpoint_ppm": 700},
            }
        )

        self.assertEqual(context.co2_control.setpoint_ppm, 700)

    def test_rejects_unsupported_setpoint(self) -> None:
        with self.assertRaises(ValidationError):
            SimulationContext.model_validate(
                {
                    "city": "paris",
                    "construction_set": "test",
                    "co2_control": {"setpoint_ppm": 550},
                }
            )


class NativeDcvIdfTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        set_energyplus_idd()

    def setUp(self) -> None:
        self.idf = load_input_idf()
        self.zone_names = find_every_thermal_zone_name(idf=self.idf)
        self.hvac_zone_names = {
            str(connection.Zone_Name).strip()
            for connection in self.idf.idfobjects["ZONEHVAC:EQUIPMENTCONNECTIONS"]
        }.intersection(self.zone_names)

    def test_configures_all_zones_and_existing_mechanical_controller(self) -> None:
        configure_co2_dcv(
            idf=self.idf,
            zone_names=self.zone_names,
            setpoint_ppm=800,
        )

        controllers = self.idf.idfobjects[
            "ZONECONTROL:CONTAMINANTCONTROLLER"
        ]
        self.assertEqual(len(controllers), len(self.hvac_zone_names))
        self.assertEqual(
            {controller.Zone_Name for controller in controllers},
            self.hvac_zone_names,
        )

        mechanical = self.idf.idfobjects[
            "CONTROLLER:MECHANICALVENTILATION"
        ]
        self.assertTrue(mechanical)
        self.assertTrue(
            all(
                controller.Demand_Controlled_Ventilation == "Yes"
                and controller.System_Outdoor_Air_Method
                == "IndoorAirQualityProcedure"
                for controller in mechanical
            )
        )

    def test_configuration_is_idempotent(self) -> None:
        for _ in range(2):
            configure_co2_dcv(
                idf=self.idf,
                zone_names=self.zone_names,
                setpoint_ppm=500,
            )

        named_schedules = [
            schedule
            for schedule in self.idf.idfobjects["SCHEDULE:CONSTANT"]
            if schedule.Name == "CO2_CONTROL_SETPOINT_500"
        ]
        controllers = [
            controller
            for controller in self.idf.idfobjects[
                "ZONECONTROL:CONTAMINANTCONTROLLER"
            ]
            if controller.Name.startswith("CO2 Control - ")
        ]
        self.assertEqual(len(named_schedules), 1)
        self.assertEqual(len(controllers), len(self.hvac_zone_names))

    def test_reports_incompatible_hvac_topology(self) -> None:
        for controller in list(
            self.idf.idfobjects["CONTROLLER:MECHANICALVENTILATION"]
        ):
            self.idf.removeidfobject(controller)

        with self.assertRaisesRegex(
            ValueError,
            "no Controller:MechanicalVentilation",
        ):
            configure_co2_dcv(
                idf=self.idf,
                zone_names=self.zone_names,
                setpoint_ppm=1000,
            )


if __name__ == "__main__":
    unittest.main()
