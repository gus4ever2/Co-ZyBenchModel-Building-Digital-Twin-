"""Define an AirflowNetwork multizone surface object."""

from pydantic import BaseModel


class MultizoneSurface(BaseModel):
    Surface_Name: str  # Name of the existing EnergyPlus surface connected to the airflow network.
    Leakage_Component_Name: str  # Crack or opening component that defines airflow through this surface.
    WindowDoor_Opening_Factor_or_Crack_Factor: float | None = None  # Optional opening or crack factor; omitted when the IDD default is used.
    Ventilation_Control_Mode: str | None = None  # Optional opening control mode assigned to this surface.
