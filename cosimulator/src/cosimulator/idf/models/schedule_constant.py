"""Define a constant schedule shared by IDF configuration packages."""

from pydantic import BaseModel


class ScheduleConstant(BaseModel):
    Name: str  # IDF identifier referenced by the object using this schedule.
    Hourly_Value: float  # Constant initial value; an actuator may later replace it.
    Schedule_Type_Limits_Name: str | None = None  # Optional name of the schedule's allowed range and numeric type.
