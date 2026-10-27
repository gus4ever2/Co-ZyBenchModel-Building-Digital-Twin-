"""Find thermal zone names in the current simulation's IDF."""

from eppy.modeleditor import IDF

from cosimulator.core.logger.logging import logger


def find_every_thermal_zone_name(
        idf: IDF,
) -> set[str]:
    try:
        zone_names = {zone.Name for zone in idf.idfobjects["ZONE"]}  # Read unique thermal-zone names from this simulation's working IDF.
        logger.info(f"Zone found in idf file: {zone_names}")
        return zone_names

    except Exception as err:
        logger.exception("Zone not found in idf file "
                         f"Error: {err}")
        raise
