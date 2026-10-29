"""Names and schedules shared by native living walls and CO2 runtime control."""

PREFIX = "CozyBench Hydroponic "
AVAILABILITY_SCHEDULE = PREFIX + "Availability"
LED_INTENSITY_SCHEDULE = PREFIX + "LED Intensity"
BACKING_CONSTRUCTION = "Interior Partition"
LIGHTS_ON_HOUR = 8
LIGHTS_OFF_HOUR = 22


def add_led_intensity_schedule(idf) -> None:
    """Use the same daily 08:00β€“22:00 light period as the CO2 plant profile."""
    schedule = idf.newidfobject(
        "SCHEDULE:COMPACT",
        Name=LED_INTENSITY_SCHEDULE,
        Schedule_Type_Limits_Name="Fraction",
    )
    fields = ("Through: 12/31", "For: AllDays", f"Until: {LIGHTS_ON_HOUR:02d}:00", 0.0, f"Until: {LIGHTS_OFF_HOUR:02d}:00", 1.0, "Until: 24:00", 0.0)
    for index, value in enumerate(fields, start=1):
        setattr(schedule, f"Field_{index}", value)
