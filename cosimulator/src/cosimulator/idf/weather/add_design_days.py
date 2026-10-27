"""Copy site location and design days from the chosen weather file."""

from eppy.modeleditor import IDF
from pathlib import Path

from cosimulator.core.logger.logging import logger
from cosimulator.core.paths.project_paths import WEATHER_DIR


def add_design_days(
        idf: IDF,
        city: str,
) -> IDF:
    """
    Adds Site:Location and SizingPeriod:DesignDay objects from a .ddy file
    into the given IDF.

    Returns
    -------
    IDF
        Modified IDF object.
    """

    ddy_file_name: str = city + ".ddy"  # DDY filename follows the selected city identifier.
    ddy_file_path: Path = WEATHER_DIR / city / ddy_file_name  # City-specific folder containing location and sizing conditions.

    if not ddy_file_path.exists():
        logger.error(f"DDY file not found: {ddy_file_path}")
        raise FileNotFoundError(f"DDY file not found: {ddy_file_path}")

    logger.info(f"Loading DDY file: {ddy_file_path} "
                f"for {city}")

    ddy_idf = IDF(str(ddy_file_path))  # Read the DDY with the same IDD used for the working model.

    # Remove old Site:Location from main IDF
    idf.removeallidfobjects("SITE:LOCATION")  # Remove the template location before installing the selected city's location.

    locations = ddy_idf.idfobjects["SITE:LOCATION"]  # Location records found in the selected DDY.

    if not locations:
        logger.error(f"No Site:Location object found in: {ddy_file_path}")
        raise ValueError(f"No Site:Location object found in: {ddy_file_path}")

    idf.copyidfobject(locations[0])  # Copy the first DDY location into the working model.
    logger.info(f"Location added for {city}")

    # Remove old design days from main IDF
    idf.removeallidfobjects("SIZINGPERIOD:DESIGNDAY")  # Replace the template's design days with those for the selected city.

    design_days = ddy_idf.idfobjects["SIZINGPERIOD:DESIGNDAY"]  # Weather conditions EnergyPlus uses to size HVAC equipment.

    if not design_days:
        logger.error(f"No SizingPeriod:DesignDay objects found in: {ddy_file_path}")
        raise ValueError(f"No SizingPeriod:DesignDay objects found in: {ddy_file_path}")

    for design_day in design_days:
        idf.copyidfobject(design_day)  # Copy each sizing day without modifying the source DDY.

    logger.info(f"Added {len(design_days)} Design Day objects for {city}")

    return idf
