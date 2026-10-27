"""Define the zone air contaminant balance object."""

from pydantic import BaseModel


class ZoneAirContaminantBalance(BaseModel):
    Carbon_Dioxide_Concentration: str = "Yes"  # Enable CO2 concentration calculations in EnergyPlus.
    Outdoor_Carbon_Dioxide_Schedule_Name: str  # Schedule supplying the outdoor CO2 concentration.
    Generic_Contaminant_Concentration: str = "No"  # Generic contaminant simulation is not enabled here.
