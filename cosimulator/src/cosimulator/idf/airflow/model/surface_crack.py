"""Define an AirflowNetwork surface crack component."""

from pydantic import BaseModel


class SurfaceCrack(BaseModel):
    Name: str = "Exterior Surface Crack"  # Component name referenced by exterior airflow surfaces.
    Air_Mass_Flow_Coefficient_at_Reference_Conditions: float = 0.01  # Reference leakage coefficient for the crack model.
    Air_Mass_Flow_Exponent: float = 0.667  # Exponent relating crack airflow to the pressure difference.
