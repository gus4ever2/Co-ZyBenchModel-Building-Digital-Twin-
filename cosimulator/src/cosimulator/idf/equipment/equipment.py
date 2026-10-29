"""Coordinate optional equipment for a simulation."""

from eppy.modeleditor import IDF

from cosimulator.idf.utils.find_every_thermal_zone_name import find_every_thermal_zone_name
from cosimulator.idf.idf_build_context import IdfBuildContext
from cosimulator.idf.idf_configurator import IdfConfigurator
from cosimulator.idf.equipment.plant_loads import add_indoor_living_walls


def equipment(idf: IDF, context: IdfBuildContext) -> None:
    """Add native indoor living walls when a plant is selected."""
    settings = context.plant_simulation  # Plant selections for this run; None means no plant was requested.
    if settings is None:  # Leave the IDF unchanged when plant simulation is disabled.
        return
    if not settings.plant_id:  # A plant profile cannot be loaded without its identifier.
        raise ValueError("plant_id is required for the living-wall model")
    from cosimulator.services.plant_profile_grid_service import plant_profile_grid_service

    profile = plant_profile_grid_service.get(plant_id=settings.plant_id)  # Load the response grid belonging to the selected plant.
    if profile is None:  # Stop preparation rather than silently generating incomplete plant loads.
        raise ValueError("Plant profile is missing for the living-wall model")
    add_indoor_living_walls(idf=idf, zone_names=find_every_thermal_zone_name(idf=idf),
                           settings=settings, profile=profile)


class EquipmentConfigurator(IdfConfigurator):
    """Add optional equipment after its dependent IDF objects exist."""

    def configure(self, *, idf: IDF, context: IdfBuildContext) -> None:
        equipment(idf=idf, context=context)
