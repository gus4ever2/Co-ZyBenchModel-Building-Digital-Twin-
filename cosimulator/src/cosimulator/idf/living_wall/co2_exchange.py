"""Create EnergyPlus CO2 sources and sinks driven by plant callbacks."""

from eppy.modeleditor import IDF

from cosimulator.core.logger.logging import logger
from cosimulator.idf.insert_idf_model import insert_idf_model
from cosimulator.idf.models.schedule_constant import ScheduleConstant
from cosimulator.idf.living_wall.model.co2_source_and_sink import Co2SourceAndSink


_SCHEDULE_OBJECT_TYPE = "SCHEDULE:CONSTANT"
_CO2_OBJECT_TYPE = "ZONECONTAMINANTSOURCEANDSINK:CARBONDIOXIDE"


def _remove_named_object(
    *,
    idf: IDF,
    object_type: str,
    object_name: str,
) -> None:
    """Remove an existing generated object so rebuilding remains idempotent."""
    for idf_object in list(idf.idfobjects[object_type]):
        if idf_object.Name == object_name:
            idf.removeidfobject(idf_object)


def _add_actuated_co2_exchange_object(
    *,
    idf: IDF,
    zone_name: str,
    direction: str,
    design_generation_rate_m3_s: float,
) -> None:
    """Create one CO2 object and the constant schedule used as its actuator."""
    schedule_name = f"{zone_name} CO2 {direction} Schedule"  # Runtime-actuated schedule for this zone and exchange direction.
    object_name = f"{zone_name} CO2 {direction}"  # Name of the corresponding EnergyPlus source or sink.

    _remove_named_object(
        idf=idf,
        object_type=_SCHEDULE_OBJECT_TYPE,
        object_name=schedule_name,
    )
    _remove_named_object(
        idf=idf,
        object_type=_CO2_OBJECT_TYPE,
        object_name=object_name,
    )

    # The zero initial value is important: before the Python callback writes
    # its first value, the plant must neither absorb nor release CO2.
    insert_idf_model(idf, _SCHEDULE_OBJECT_TYPE, ScheduleConstant(
        Name=schedule_name, Schedule_Type_Limits_Name="Any Number", Hourly_Value=0.0))

    # EnergyPlus interprets a negative design generation rate as a sink and
    # a positive one as a source. A magnitude of 1 m3/s makes the actuated
    # schedule value equal to the desired physical volume-flow rate.
    insert_idf_model(idf, _CO2_OBJECT_TYPE, Co2SourceAndSink(
        Name=object_name, Zone_Name=zone_name,
        Design_Generation_Rate=design_generation_rate_m3_s, Schedule_Name=schedule_name))


def add_plant_co2_exchange(
    *,
    idf: IDF,
    zone_names: set[str],
) -> IDF:
    """Add independently actuated plant CO2 sinks and sources to every zone.

    The sink represents photosynthetic uptake. The source represents net
    respiration, which occurs in the generated profiles when uptake is
    negative (normally at night). Only one of their schedules is non-zero at
    any timestep, so the two EnergyPlus objects never double-count exchange.
    """
    try:
        for zone_name in zone_names:  # Each thermal zone receives an independent source and sink.
            _add_actuated_co2_exchange_object(
                idf=idf,
                zone_name=zone_name,
                direction="Sink",
                design_generation_rate_m3_s=-1.0,  # A negative design rate represents photosynthetic uptake.
            )
            _add_actuated_co2_exchange_object(
                idf=idf,
                zone_name=zone_name,
                direction="Source",
                design_generation_rate_m3_s=1.0,  # A positive design rate represents CO2 release.
            )

        logger.info(
            "Added plant CO2 sink/source controls for %s zones",
            len(zone_names),
        )
        return idf
    except Exception as err:
        logger.exception(
            "Failed to add plant CO2 exchange controls. Error: `%s`",
            err,
        )
        raise
