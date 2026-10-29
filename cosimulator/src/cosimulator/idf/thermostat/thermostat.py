"""Change occupied setpoints without replacing times or setback values."""

from eppy.modeleditor import IDF

from cosimulator.idf.idf_build_context import IdfBuildContext
from cosimulator.idf.idf_configurator import IdfConfigurator


def _day_schedules(idf: IDF, name: str, visiting: frozenset[str] = frozenset()):
    """Resolve only the schedule hierarchy used by the input IDF's thermostats."""
    key = name.strip().casefold()
    if key in visiting:
        raise ValueError(f"Circular thermostat schedule reference: {name}")
    visiting = visiting | {key}
    for kind in ("SCHEDULE:YEAR", "SCHEDULE:WEEK:DAILY", "SCHEDULE:DAY:INTERVAL"):
        schedule = next(
            (obj for obj in idf.idfobjects[kind] if obj.Name.strip().casefold() == key),
            None,
        )
        if schedule is None:
            continue
        if kind == "SCHEDULE:DAY:INTERVAL":
            return {key: schedule}
        fields = [
            field for field in schedule.fieldnames
            if (field.startswith("ScheduleWeek_Name_") if kind == "SCHEDULE:YEAR"
                else field.endswith("_ScheduleDay_Name"))
        ]
        result = {}
        for field in fields:
            child = str(schedule[field]).strip()
            if child:
                result.update(_day_schedules(idf, child, visiting))
        if not result:
            raise ValueError(f"No thermostat day schedules found in {name}")
        return result
    raise ValueError(f"Unsupported or missing thermostat schedule: {name}")


def _occupied_updates(days, requested: float, *, heating: bool):
    fields = [
        (day, field, float(day[field]))
        for day in days.values()
        for field in day.fieldnames
        if field.startswith("Value_Until_Time_") and day[field] != ""
    ]
    values = {value for _, _, value in fields}
    if not values:
        raise ValueError("Thermostat schedule has no temperature values.")
    # Find the occupied level across the complete week, not within each day:
    # weekend schedules contain only the setback and must remain untouched.
    if len(values) > 2:
        raise ValueError("Thermostat schedules must contain occupied and setback levels only.")
    occupied = max(values) if heating else min(values)
    setback = min(values) if heating else max(values)
    if len(values) == 1:
        if occupied == requested:
            return []
        raise ValueError("Cannot distinguish occupied and setback thermostat values.")
    if (heating and requested < setback) or (not heating and requested > setback):
        raise ValueError("Occupied setpoint must remain inside the existing setback temperatures.")
    return [(day, field, requested) for day, field, value in fields if value == occupied]


class ThermostatConfigurator(IdfConfigurator):
    def configure(self, *, idf: IDF, context: IdfBuildContext) -> None:
        settings = context.thermostat_setpoints
        if settings is None:
            return  # Older requests keep the original IDF exactly as supplied.
        heating_days, cooling_days = {}, {}
        duals = {}
        for control in idf.idfobjects["ZONECONTROL:THERMOSTAT"]:
            for index in range(1, 5):
                if str(control[f"Control_{index}_Object_Type"]).casefold() != "thermostatsetpoint:dualsetpoint":
                    continue
                name = str(control[f"Control_{index}_Name"]).strip()
                dual = idf.getobject("THERMOSTATSETPOINT:DUALSETPOINT", name)
                if dual is None:
                    raise ValueError(f"Missing thermostat dual setpoint: {name}")
                duals[name.casefold()] = dual
        if not duals:
            raise ValueError("No supported dual-setpoint zone thermostats found.")
        for dual in duals.values():
            heating_days.update(_day_schedules(idf, dual.Heating_Setpoint_Temperature_Schedule_Name))
            cooling_days.update(_day_schedules(idf, dual.Cooling_Setpoint_Temperature_Schedule_Name))
        if heating_days.keys() & cooling_days.keys():
            raise ValueError("Heating and cooling must use separate day schedules.")
        # Validate both schedules before modifying either one.
        updates = _occupied_updates(heating_days, settings.heating_setpoint_c, heating=True)
        updates += _occupied_updates(cooling_days, settings.cooling_setpoint_c, heating=False)
        for day, field, value in updates:
            day[field] = value
