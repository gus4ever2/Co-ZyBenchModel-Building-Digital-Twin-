"""Create the actuated plant sensible and latent heat equipment."""

from cosimulator.idf.equipment.model.other_equipment import OtherEquipment
from cosimulator.idf.insert_idf_model import upsert_idf_model
from cosimulator.idf.models.schedule_constant import ScheduleConstant


def add_other_equipment_for_plants(idf, zone_names: set[str], prefix: str) -> None:
    """Create actuated latent and sensible plant loads for each zone."""
    for zone in sorted(zone_names):  # Use stable zone ordering when creating the IDF objects.
        for load, latent in (("Latent", 1.0), ("Sensible", 0.0)):  # Each zone receives one all-latent load and one convective sensible load.
            name = prefix + zone + f" Plant {load} Load"  # Shared equipment/schedule name expected by the runtime actuator lookup.
            upsert_idf_model(idf, "SCHEDULE:CONSTANT", ScheduleConstant(Name=name, Hourly_Value=0.0))  # Start at zero until the plant callback writes its timestep load.
            equipment = OtherEquipment(
                Name=name,
                Fuel_Type="None",  # The plant load is not treated as a fuel-consuming appliance.
                Zone_or_ZoneList_or_Space_or_SpaceList_Name=zone,
                Schedule_Name=name,
                Design_Level_Calculation_Method="EquipmentLevel",
                Design_Level=1.0,  # At 1 W design level, the schedule directly represents the load in watts.
                Fraction_Latent=latent,  # The loop chooses 1 for latent heat or 0 for the sensible load.
                Fraction_Radiant=0.0,
                Fraction_Lost=0.0,
                Carbon_Dioxide_Generation_Rate=0.0,  # Plant CO2 is handled by separate source and sink objects.
                EndUse_Subcategory=f"PhotosynEB {load}",
            )
            upsert_idf_model(idf, "OTHEREQUIPMENT", equipment)  # Rebuilds update the named object rather than accumulating duplicates.
