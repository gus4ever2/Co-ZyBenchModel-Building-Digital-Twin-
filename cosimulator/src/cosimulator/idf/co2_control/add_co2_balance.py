"""Enable EnergyPlus zone contaminant balance for CO2 simulations."""

from eppy.modeleditor import IDF

from cosimulator.core.logger.logging import logger
from cosimulator.idf.insert_idf_model import insert_idf_model
from cosimulator.idf.models.schedule_constant import ScheduleConstant
from cosimulator.idf.co2_control.model.zone_air_contaminant_balance import ZoneAirContaminantBalance


def add_co2_balance(
        idf: IDF,
        outdoor_co2_ppm: float = 400,
        schedule_name: str = "Outdoor CO2 Schedule",
) -> IDF:
    balance_type = "ZONEAIRCONTAMINANTBALANCE"  # EnergyPlus object that enables zone CO2 calculations.
    schedule_type = "SCHEDULE:CONSTANT"  # Object type used to provide a constant outdoor CO2 value.

    try:
        idf.removeallidfobjects(balance_type)  # Replace the old balance so only one generated balance remains.

        for schedule in list(idf.idfobjects[schedule_type]):
            if schedule.Name == schedule_name:  # Replace only the outdoor CO2 schedule managed here.
                idf.removeidfobject(schedule)

        insert_idf_model(idf, schedule_type, ScheduleConstant(
            Name=schedule_name, Schedule_Type_Limits_Name="Any Number", Hourly_Value=outdoor_co2_ppm))
        insert_idf_model(idf, balance_type, ZoneAirContaminantBalance(
            Outdoor_Carbon_Dioxide_Schedule_Name=schedule_name))

        logger.info(
            f"Enabled CO2 control with outdoor concentration {outdoor_co2_ppm} ppm",
        )

        return idf

    except Exception as err:
        logger.exception("Failed to configure CO2 simulation "
                         f"Error: `{err}`"
                         )
        raise

