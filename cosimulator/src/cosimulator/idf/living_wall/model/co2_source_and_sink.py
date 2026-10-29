"""Define a zone CO2 source or sink EnergyPlus object."""

from pydantic import BaseModel


class Co2SourceAndSink(BaseModel):
    """Fields of a ZoneContaminantSourceAndSink:CarbonDioxide object."""
    Name: str  # Name of the generated zone source or sink.
    Zone_Name: str  # Existing thermal zone receiving this CO2 exchange.
    Design_Generation_Rate: float  # Signed design flow in m3/s: negative for uptake, positive for release.
    Schedule_Name: str  # Actuated schedule scales the design flow at each timestep.
