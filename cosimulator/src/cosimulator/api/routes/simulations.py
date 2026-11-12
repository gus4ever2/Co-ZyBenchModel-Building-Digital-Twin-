from bson import ObjectId
from fastapi import APIRouter, HTTPException
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel

from cosimulator.analytics.data import enrich_documents
from cosimulator.core.logger.logging import logger
from cosimulator.database.dto.idf_preparation_dto import ConstructionSetSnapshot
from cosimulator.schemas.simulation_context import SimulationContext
from cosimulator.services.simulation_process_service import simulation_process_service
from cosimulator.services.simulation_owner_middleware import (
    SimulationOwnerMiddleware,
)
from cosimulator.services.simulation_service import (
    delete_simulation_workspace,
    prepare_simulation,
    stop_simulation,
)
from cosimulator.services.simulation_timestep_service import (
    simulation_timestep_service,
)

simulations_router = APIRouter(
    # Every endpoint in this module is exposed below /simulations.
    prefix="/simulations",
    # This label groups endpoints in the generated OpenAPI documentation.
    tags=["Simulations"],
)


class StartSimulationRequest(BaseModel):
    """The Spring request includes the snapshot captured for this simulation."""
    owner_type: str
    owner_id: str
    simulation_context: SimulationContext  # User-selected simulation options.
    # Immutable construction/material state captured when the user clicks start.
    construction_set_snapshot: ConstructionSetSnapshot


@simulations_router.post(
    "/start-simulation",
    status_code=201,
)
def start_simulation(
    request: StartSimulationRequest,
) -> dict[str, str]:
    try:
        owner = SimulationOwnerMiddleware.resolve(
            owner_type=request.owner_type,
            owner_id=request.owner_id,
        )
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    # Store the snapshot before the separate worker starts IDF preparation.
    # The worker therefore cannot accidentally read construction data edited
    # by the user after this request has already been accepted.
    simulation_id = prepare_simulation(
        owner=owner,
        simulation_context=request.simulation_context,
        construction_set_snapshot=request.construction_set_snapshot.model_dump(),
    )

    if simulation_id is None:  # Defensive guard for a failed service startup.
        raise HTTPException(status_code=400, detail="Simulation not started")

    logger.info(
        f"Simulation started: simulation_id: `{simulation_id}` "
        f"City: `{request.simulation_context.city}` "
        f"Construction Set: `{request.simulation_context.construction_set}`"
    )

    # Spring keeps this identifier and uses it to query process/result data.
    return {
        "simulation_id": simulation_id,
    }


@simulations_router.post("/{simulation_id}/cancel")
def cancel_simulation(simulation_id: str) -> dict[str, str]:
    # Cancellation only succeeds for a local worker still tracked in memory.
    if not stop_simulation(simulation_id=simulation_id):
        raise HTTPException(
            status_code=409,
            detail="Simulation is not running in this server process",
        )

    # The process service has already persisted the CANCELED status.
    return {
        "simulation_id": simulation_id,
        "status": "CANCELED",
    }


@simulations_router.delete("/{simulation_id}", status_code=204)
def delete_simulation_workspace_files(
    simulation_id: str,
    owner_type: str,
    owner_id: str,
) -> None:
    """Delete only the selected user's local files for a non-active simulation."""
    try:
        owner = SimulationOwnerMiddleware.resolve(
            owner_type=owner_type,
            owner_id=owner_id,
        )
        delete_simulation_workspace(
            simulation_id=simulation_id,
            owner=owner,
        )
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except LookupError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except RuntimeError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error


@simulations_router.get("/available")
def send_available_simulations(
    owner_type: str,
    owner_id: str,
):
    try:
        owner = SimulationOwnerMiddleware.resolve(
            owner_type=owner_type,
            owner_id=owner_id,
        )
        # The service applies the user ownership filter before returning rows.
        simulations = (
            simulation_process_service.get_available_simulations(
                owner=owner,
            )
        )

        # Returning a count avoids forcing the frontend to recount the list.
        return {
            "count": len(simulations),
            "simulations": simulations,
        }

    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except Exception as error:
        logger.exception(
            "Failed to retrieve simulations for owner type '%s'",
            owner.owner_type.value,
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve available simulations",
        ) from error


@simulations_router.get("/{simulation_id}/results")
def send_simulation_results(
    simulation_id: str,
    owner_type: str,
    owner_id: str,
    offset: int = 0,
    limit: int | None = None,
):
    try:
        owner = SimulationOwnerMiddleware.resolve(
            owner_type=owner_type,
            owner_id=owner_id,
        )
        if simulation_process_service.dao.find_by_id_and_owner(
            document_id=simulation_id,
            owner=owner,
        ) is None:
            raise HTTPException(status_code=404, detail="Simulation not found")
        # The service owns MongoDB access; this router only formats HTTP data.
        # ``offset`` and ``limit`` are forwarded so Spring can fetch results
        # page-by-page without Python constructing an SSE stream.
        results = simulation_timestep_service.get_all_timesteps(
            simulation_id=simulation_id,
            limit=limit,
            offset=offset,
        )

        # Analytics enrichment derives presentation fields from the raw MongoDB
        # timestep document. It does not request or rerun EnergyPlus data.
        response = {
            "simulation_id": simulation_id,
            "offset": offset,
            "limit": limit,
            "returned": len(results),
            "timesteps": enrich_documents(
                [dict(row) for row in results],  # BSON rows → mutable dicts.
            ),
        }

        # ObjectId and datetime-like values must be converted for JSON/Spring.
        return jsonable_encoder(
            response,
            custom_encoder={
                ObjectId: str,
            },
        )

    except HTTPException:
        raise
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except Exception as error:
        # Avoid exposing a raw database traceback while preserving it in logs.
        logger.exception("Failed to retrieve simulation results")

        raise HTTPException(
            status_code=500,
            detail=f"{type(error).__name__}: {error}",
        ) from error
