"""Define an AirflowNetwork multizone zone object."""

from pydantic import BaseModel


class MultizoneZone(BaseModel):
    Zone_Name: str  # Name of the existing thermal zone represented in the airflow network.
    Ventilation_Control_Mode: str = "NoVent"  # Default zone-level natural-ventilation control; surfaces may override it.
