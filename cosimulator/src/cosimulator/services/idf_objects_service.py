from dataclasses import dataclass
from typing import Any

from cosimulator.core.logger.logging import logger
from cosimulator.database.dao.archive_dao import archive_dao
from cosimulator.database.dao.simulation_dao import simulation_dao
from cosimulator.database.dto.idf_preparation_dto import IdfObjectDTO, IdfPreparationDTO
from cosimulator.idf.build_idf import build_idf
from cosimulator.schemas.simulation_context import SimulationContext


@dataclass(frozen=True, slots=True, kw_only=True)
class CompareComponents:
    component_differences_1: dict[str, Any]
    component_differences_2: dict[str, Any]


def compare_construction_set(
    *,
    simulation_id_1: str,
    simulation_id_2: str,
) -> CompareComponents | None:

    construction_set_1 = archive_dao.find_by_simulation_id(simulation_id_1)
    construction_set_2 = archive_dao.find_by_simulation_id(simulation_id_2)

    if construction_set_1["Name"] == construction_set_2["Name"]:
        return None

    construction_set_differences_1: dict[str, Any] = {
        "simulation_id":construction_set_1["simulation_id"],
        "Name": construction_set_1["Name"]
    }

    construction_set_differences_2: dict[str, Any] = {
        "simulation_id":construction_set_2["simulation_id"],
        "Name": construction_set_2["Name"]
    }


    # every construction set have the same fields
    for construction, construction_properties_1 in construction_set_1.items():

        # because name isn't construction
        if construction in ["Name", "simulation_id", "_id"]:
            continue

        # checks if the name of two constructions is the same
        if construction_set_1[construction]["Name"] == construction_set_2[construction]["Name"]:
            continue

        construction_set_differences_1[construction] = {
            "Name":construction_set_1[construction]["Name"]
        }
        construction_set_differences_2[construction] = {
            "Name": construction_set_2[construction]["Name"]
        }

        # if the name isn't the same
        for construction_layer, material_properties_1 in construction_properties_1.items():

            # because name isn't material
            if construction_layer in ["Name"]:
                continue

            # checks if the name of two materials is the same
            if construction_set_1[construction][construction_layer]["Name"] == construction_set_2[construction][construction_layer]["Name"]:
                continue

            construction_set_differences_1[construction][construction_layer] = construction_set_1[construction][construction_layer]
            construction_set_differences_2[construction][construction_layer] = construction_set_2[construction][construction_layer]

    return CompareComponents(
        component_differences_1=construction_set_differences_1,
        component_differences_2=construction_set_differences_2
    )


def _archive_construction_set(
    *,
    simulation_id: str,
    idf_preparation_dto: IdfPreparationDTO,
) -> None:
    """Keep a nested construction-set record for the existing comparison API."""
    construction_set = idf_preparation_dto.construction_set
    idf_objects_by_name = {
        idf_object.name: idf_object
        for idf_object in idf_preparation_dto.idf_objects
    }

    construction_set_properties: dict[str, Any] = {"simulation_id": simulation_id}

    for property_name, property_value in construction_set.properties.items():
        if property_name == "Name":
            construction_set_properties[property_name] = property_value
            continue

        # Empty slots have no construction to expand.
        if not property_value:
            construction_set_properties[property_name] = {}
            continue

        construction = idf_objects_by_name.get(property_value)
        if construction is None:
            raise LookupError(
                f"IDF object {property_value!r} referenced by the construction set "
                "is missing from the workspace"
            )

        construction_properties: dict[str, Any] = {}

        if construction.type == "CONSTRUCTION":
            for construction_property_name, construction_property_value in construction.properties.items():
                if construction_property_name == "Name":
                    construction_properties[construction_property_name] = construction_property_value
                    continue

                if not construction_property_value:
                    construction_properties[construction_property_name] = {}
                    continue

                material = idf_objects_by_name.get(construction_property_value)
                if material is None:
                    raise LookupError(
                        f"Material {construction_property_value!r} referenced by "
                        f"construction {construction.name!r} is missing from the workspace"
                    )

                construction_properties[construction_property_name] = material.properties

        else:
            construction_properties = construction.properties

        construction_set_properties[property_name] = construction_properties

    archive_dao.save(document_data=construction_set_properties)

    logger.info(f"Construction Set: {construction_set.name}")

    return None


def start_idf_preparation(
    *,
    user_email: str,
    simulation_id: str,
    simulation_context: SimulationContext,
) -> None:
    # Read the saved snapshot, not the workspace that the user may have edited.
    simulation = simulation_dao.find_by_id_and_user_email(simulation_id, user_email)
    if simulation is None:
        raise LookupError("Simulation was not found for this user")
    snapshot = simulation.get("construction_set_snapshot")
    if snapshot is None:
        raise ValueError("Simulation is missing its construction set snapshot")
    idf_preparation_dto = preparation_from_snapshot(snapshot)

    build_idf(
        simulation_id=simulation_id,
        idf_preparation_dto=idf_preparation_dto,
        simulation_context=simulation_context,
    )

    _archive_construction_set(
        simulation_id=simulation_id,
        idf_preparation_dto=idf_preparation_dto,
    )

    return None


def preparation_from_snapshot(snapshot: dict[str, Any]) -> IdfPreparationDTO:
    """Use only the objects captured when this simulation was requested."""
    construction_set = IdfObjectDTO.model_validate(snapshot["constructionSet"])
    materials = [IdfObjectDTO.model_validate(item) for item in snapshot["materials"]]
    constructions = [
        IdfObjectDTO.model_validate(item) for item in snapshot["constructions"]
    ]
    return IdfPreparationDTO(
        construction_set=construction_set,
        idf_objects=materials + constructions,
    )
