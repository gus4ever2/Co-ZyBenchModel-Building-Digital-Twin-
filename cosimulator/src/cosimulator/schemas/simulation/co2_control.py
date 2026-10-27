"""Native EnergyPlus demand-controlled ventilation configuration."""

from typing import Literal

from pydantic import BaseModel


class CO2Control(BaseModel):
    """Allowed indoor CO2 setpoint requested for DCV."""

    setpoint_ppm: Literal[500, 600, 700, 800, 900, 1000]
