"""Define AirflowNetwork simulation-control settings."""

from typing import Literal
from pydantic import BaseModel


class SimulationControl(BaseModel):
    Name: str = "Building Airflow Network"  # Identifier for the generated AirflowNetwork control object.
    AirflowNetwork_Control: Literal["MultizoneWithoutDistribution"] = "MultizoneWithoutDistribution"  # Model airflow between zones without an AFN distribution system.
    Wind_Pressure_Coefficient_Type: str = "SurfaceAverageCalculation"  # Let EnergyPlus calculate surface-average wind pressure coefficients.
    Height_Selection_for_Local_Wind_Pressure_Calculation: str = "OpeningHeight"  # Evaluate local wind pressure at each opening's height.
    Building_Type: str = "LowRise"  # Building category used in wind pressure coefficient calculations.
