"""Configure AirflowNetwork openings and zones for the building."""

from eppy.modeleditor import IDF

from cosimulator.core.logger.logging import logger
from cosimulator.idf.airflow.model.simple_opening import SimpleOpening
from cosimulator.idf.airflow.model.multizone_zone import MultizoneZone
from cosimulator.idf.airflow.model.multizone_surface import MultizoneSurface
from cosimulator.idf.insert_idf_model import insert_idf_model
from cosimulator.idf.airflow.utils.find_zones_with_two_airflow_links import find_zones_with_two_airflow_links
from cosimulator.idf.airflow.find_exterior_windows_by_zone import (
    find_exterior_window_names_by_zone,
    find_interior_opening_names,
)

# AFN opening construction --------------------------------------------------
# Build reusable opening components, links, then the eligible AFN zone objects.

def _add_simple_opening(*, idf: IDF, name: str) -> IDF:
    object_type = "AIRFLOWNETWORK:MULTIZONE:COMPONENT:SIMPLEOPENING"  # EnergyPlus component defining airflow through an opening.

    insert_idf_model(idf, object_type, SimpleOpening(Name=name))

    logger.info("Added AFN SimpleOpening")
    return idf


def _add_airflow_network_zones(
    *,
    idf: IDF,
    zone_names: set[str],
) -> IDF:
    object_type = "AIRFLOWNETWORK:MULTIZONE:ZONE"  # Network representation of an existing thermal zone.

    idf.removeallidfobjects(object_type)
    eligible_zone_names = find_zones_with_two_airflow_links(idf)  # EnergyPlus requires at least two network linkages for a modeled zone.
    for zone_name in zone_names & eligible_zone_names:  # Only add requested thermal zones that satisfy the linkage requirement.
        insert_idf_model(idf, object_type, MultizoneZone(Zone_Name=zone_name))

    excluded_zone_names = zone_names - eligible_zone_names  # Zones omitted because they do not have enough airflow connections.
    logger.info("Added %d AirflowNetwork zones", len(zone_names & eligible_zone_names))
    if excluded_zone_names:
        logger.warning(
            "Excluded zones without two AFN linkages: %s",
            sorted(excluded_zone_names),
        )
    return idf


def _connect_simple_openings(
    *,
    idf: IDF,
    opening_names: set[str],
    component_name: str,
    ventilation_control_mode: str,
) -> IDF:
    object_type = "AIRFLOWNETWORK:MULTIZONE:SURFACE"  # Object type that attaches an airflow component to an opening.

    for afn_surface in list(idf.idfobjects[object_type]):
        if afn_surface.Surface_Name in opening_names:  # Replace an existing linkage for an opening before adding the new one.
            idf.removeidfobject(afn_surface)

    for opening_name in opening_names:  # Create one airflow-network surface for each selected opening.
        insert_idf_model(idf, object_type, MultizoneSurface(
            Surface_Name=opening_name, Leakage_Component_Name=component_name,
            WindowDoor_Opening_Factor_or_Crack_Factor=1.0,
            Ventilation_Control_Mode=ventilation_control_mode))

    logger.info("Connected %d AFN openings to %s", len(opening_names), component_name)
    return idf


def add_open_windows(
    *,
    idf: IDF,
    zone_names: set[str],
) -> IDF:
    """Configure exterior windows for runtime actuator control."""
    # The generated IDF owns both SimpleOpening definitions, so recreate the
    # complete pair on every build.  Clearing here (rather than in
    # _add_simple_opening) is important: both components must coexist.
    idf.removeallidfobjects("AIRFLOWNETWORK:MULTIZONE:COMPONENT:SIMPLEOPENING")
    idf = _add_simple_opening(idf=idf, name="Operable Exterior Window")
    idf = _add_simple_opening(idf=idf, name="Interior Door and Window")
    windows_by_zone = find_exterior_window_names_by_zone(idf=idf)  # Find outdoor-facing windows grouped by their parent thermal zone.
    window_names = {  # Flatten those groups into the set of exterior window names.
        window_name
        for zone_window_names in windows_by_zone.values()
        for window_name in zone_window_names
    }

    idf = _connect_simple_openings(
        idf=idf,
        opening_names=window_names,
        component_name="Operable Exterior Window",
        ventilation_control_mode="ZoneLevel",  # Allow runtime control of the exterior opening factor.
    )
    idf = _connect_simple_openings(
        idf=idf,
        opening_names=find_interior_opening_names(idf=idf),
        component_name="Interior Door and Window",
        # Interior doors/windows provide a closed-opening leakage path. They
        # are not operated by the exterior-window controller.
        ventilation_control_mode="NoVent",  # Keep interior openings on their closed-opening leakage path.
    )
    return _add_airflow_network_zones(idf=idf, zone_names=zone_names)
