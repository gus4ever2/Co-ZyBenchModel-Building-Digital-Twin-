"""Define the EnergyPlus OtherEquipment fields used for plant loads."""

from pydantic import BaseModel


class OtherEquipment(BaseModel):
    Name: str  # Unique name also used to locate the actuator at runtime.
    Fuel_Type: str  # EnergyPlus fuel category; plant thermal loads use None.
    Zone_or_ZoneList_or_Space_or_SpaceList_Name: str  # Zone or other EnergyPlus location receiving the load.
    Schedule_Name: str  # Actuated schedule that scales the design level.
    Design_Level_Calculation_Method: str  # Selects how EnergyPlus interprets the equipment capacity.
    Design_Level: float  # Design load in watts; 1 W makes the schedule value equal to load in W.
    Fraction_Latent: float  # Fraction of the load released as latent heat.
    Fraction_Radiant: float  # Fraction released as radiant heat.
    Fraction_Lost: float  # Fraction not delivered as a zone heat gain.
    Carbon_Dioxide_Generation_Rate: float  # CO2 generation per watt; plant CO2 is controlled separately.
    EndUse_Subcategory: str  # EnergyPlus reporting label distinguishing plant load types.
