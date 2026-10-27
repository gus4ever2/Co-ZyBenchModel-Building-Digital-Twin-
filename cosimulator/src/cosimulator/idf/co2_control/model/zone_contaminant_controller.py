"""Define a zone contaminant controller object."""

from pydantic import BaseModel


class ZoneContaminantController(BaseModel):
    Name: str  # Unique name of this zone's CO2 controller.
    Zone_Name: str  # Thermal zone monitored by the controller.
    Carbon_Dioxide_Control_Availability_Schedule_Name: str  # Schedule controlling when the CO2 controller is available.
    Carbon_Dioxide_Setpoint_Schedule_Name: str  # Schedule containing the requested CO2 setpoint in ppm.
