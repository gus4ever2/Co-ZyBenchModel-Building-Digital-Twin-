"""Define an AirflowNetwork simple opening component."""

from pydantic import BaseModel


class SimpleOpening(BaseModel):
    Name: str  # Unique component name referenced by airflow surfaces.
    Air_Mass_Flow_Coefficient_When_Opening_is_Closed: float = 0.001  # Leakage coefficient used when the opening is closed.
    Air_Mass_Flow_Exponent_When_Opening_is_Closed: float = 0.65  # Pressure exponent for the closed-opening leakage relationship.
    Minimum_Density_Difference_for_TwoWay_Flow: float = 0.0001  # Density difference threshold for two-way flow.
    Discharge_Coefficient: float = 0.78  # Dimensionless coefficient describing flow through the open aperture.
