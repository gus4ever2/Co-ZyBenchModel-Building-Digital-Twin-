"""Configure AirflowNetwork cracks for the building envelope."""

from eppy.modeleditor import IDF

from cosimulator.core.logger.logging import logger
from cosimulator.idf.construction_set.change_construction_set import Surface
from cosimulator.idf.construction_set.utils.classify_surface import classify_surface
from cosimulator.idf.airflow.model.simulation_control import SimulationControl
from cosimulator.idf.airflow.model.surface_crack import SurfaceCrack
from cosimulator.idf.airflow.model.multizone_surface import MultizoneSurface
from cosimulator.idf.insert_idf_model import insert_idf_model


def _add_airflow_network_control(*, idf: IDF) -> IDF:
    object_type = "AIRFLOWNETWORK:SIMULATIONCONTROL"  # IDF object that turns on and configures the airflow network.

    idf.removeallidfobjects(object_type)
    insert_idf_model(idf, object_type, SimulationControl())

    logger.info("Added '%s'", object_type)
    return idf


def _add_airflow_network_crack(*, idf: IDF) -> IDF:
    object_type = "AIRFLOWNETWORK:MULTIZONE:SURFACE:CRACK"  # Shared crack component used by external envelope surfaces.

    idf.removeallidfobjects(object_type)
    insert_idf_model(idf, object_type, SurfaceCrack())

    logger.info("Added '%s'", object_type)
    return idf


def _find_exterior_wall_and_roof_names(*, idf: IDF) -> set[str]:
    surface_names: set[str] = set()  # Names of exterior walls and roofs to connect to the crack component.

    for surface_object in idf.idfobjects["BuildingSurface:Detailed"]:
        surface = Surface(  # Extract only the fields required for surface classification.
            Name=surface_object.Name,
            Surface_Type=surface_object.Surface_Type,
            Outside_Boundary_Condition=(
                surface_object.Outside_Boundary_Condition
            ),
        )

        if classify_surface(surface) in {
            "exteriorWall",
            "exteriorRoof",
        }:
            surface_names.add(surface.Name)  # Only outdoor walls and roofs receive this generated crack linkage.

    return surface_names


def _connect_cracks_to_exterior_surfaces(
    *,
    idf: IDF,
    surface_names: set[str],
) -> IDF:
    object_type = "AIRFLOWNETWORK:MULTIZONE:SURFACE"  # Links a building surface to an AirflowNetwork component.

    idf.removeallidfobjects(object_type)

    for surface_name in surface_names:  # Create a separate airflow linkage for every eligible exterior surface.
        insert_idf_model(idf, object_type, MultizoneSurface(
            Surface_Name=surface_name, Leakage_Component_Name="Exterior Surface Crack"))

    logger.info(
        "Connected %d exterior surfaces to airflow cracks",
        len(surface_names),
    )
    return idf


def add_airflow_cracks(*, idf: IDF) -> IDF:
    """Enable AirflowNetwork and add cracks to exterior walls and roofs."""
    idf.removeallidfobjects("ZONEINFILTRATION:DESIGNFLOWRATE")  # Avoid retaining the template's design-flow infiltration alongside AFN.

    idf = _add_airflow_network_control(idf=idf)  # Install the global airflow network control settings.
    idf = _add_airflow_network_crack(idf=idf)  # Create the crack component referenced by the generated linkages.
    surface_names = _find_exterior_wall_and_roof_names(idf=idf)  # Identify the building envelope surfaces that can use that crack.

    return _connect_cracks_to_exterior_surfaces(
        idf=idf,
        surface_names=surface_names,
    )
