"""Create the static dependencies needed by the plant case study."""

from eppy.modeleditor import IDF

from cosimulator.schemas.simulation_context import PlantSimulation
from cosimulator.simulation.case_study.plant.calculate_green_wall_area import (
    calculate_green_wall_area_by_zone,
)
from cosimulator.simulation.case_study.plant.plant_case_study import (
    PlantCaseStudy,
)
from cosimulator.simulation.case_study.plant.plant_profile_lookup import (
    PlantProfileLookup,
)


def create_plant_case_study(
    *,
    idf: IDF,
    city: str,
    settings: PlantSimulation,
    zone_names: set[str],
) -> PlantCaseStudy:
    """Create one plant controller with data that remains fixed for the run."""
    return PlantCaseStudy(
        settings=settings,
        profile_lookup=PlantProfileLookup(
            city=city,
            plant_name=settings.plant_name,
            plant_id=settings.plant_id,
        ),
        green_wall_area_by_zone=calculate_green_wall_area_by_zone(
            idf=idf,
            green_wall_size=settings.green_wall_size,
            coverage_percentage=settings.coverage_percentage,
            idf_zone_names=zone_names,
        ),
        zone_names=zone_names,
    )
