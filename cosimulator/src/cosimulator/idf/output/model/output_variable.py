"""Define an EnergyPlus output-variable request."""

from pydantic import BaseModel


class OutputVariable(BaseModel):
    Key_Value: str  # Object selector; '*' requests all applicable objects.
    Variable_Name: str  # Exact EnergyPlus output-variable name.
    Reporting_Frequency: str  # Interval at which EnergyPlus records the variable.
