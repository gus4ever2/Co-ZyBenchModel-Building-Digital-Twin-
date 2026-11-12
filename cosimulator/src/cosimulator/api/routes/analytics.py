"""HTTP controller for simulation analytics.

The controller owns request validation and HTTP status codes. The analytics
service owns MongoDB access and all calculation orchestration.
"""

from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Query
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, Field

from cosimulator.analytics.service import (
    AnalyticsServiceError,
    SimulationNotFoundError,
    analytics_service,
)
from cosimulator.services.simulation_owner_middleware import (
    SimulationOwnerMiddleware,
)


analytics_router = APIRouter(
    # Analytics belongs to an existing simulation resource.
    prefix="/simulations",
    # OpenAPI groups these endpoints separately from run control.
    tags=["Analytics"],
)


class AnalyticsOptions(BaseModel):
    """Optional analytic selection and cursor range for one simulation."""

    selected: list[str] | None = None  # None requests the standard set.
    startIndex: int = Field(default=0, ge=0)  # Inclusive timestep index.
    endIndex: int | None = Field(default=None, ge=0)  # Optional end index.


class ComparisonRequest(BaseModel):
    """Body accepted by the comparison endpoint."""

    owner_type: str
    owner_id: str
    simulationIds: list[str] = Field(min_length=2, max_length=6)  # Baseline + peers.
    analysisStart: datetime | None = None  # Optional common time-range start.
    analysisEnd: datetime | None = None  # Optional common time-range end.
    references: list[dict] = Field(default_factory=list)  # Frontend labels/metadata.
    plantConfigurations: list[dict] = Field(default_factory=list)  # UI metadata.


class ComparisonResponse(BaseModel):
    """Stable response contract consumed by the comparison frontend."""

    schemaVersion: int = 1  # Lets the frontend reject incompatible contracts.
    baseline: dict  # Reference simulation used for delta calculations.
    analysisRange: dict  # Actual timestamps applied to all simulations.
    comparisons: list[dict]  # Aggregate differences against the baseline.
    plantConfigurations: list[dict]  # Configuration labels for the UI.
    analyticsBySimulation: dict  # Chart-ready values grouped by simulation.


@analytics_router.get("/analytics/available")
def available() -> dict:
    """Return the standard analytic names that callers may select."""
    # The registry remains inside the analytics package, not this HTTP layer.
    return {"analytics": analytics_service.available_analytics()}


@analytics_router.get("/{simulation_id}/analytics")
def analytics(
    simulation_id: str,
    owner_type: str,
    owner_id: str,
    analysisStart: datetime | None = None,
    analysisEnd: datetime | None = None,
    startIndex: int = Query(0, ge=0),
    endIndex: int | None = Query(None, ge=0),
):
    """Return the default analytics for one owned simulation."""
    try:
        owner = SimulationOwnerMiddleware.resolve(
            owner_type=owner_type,
            owner_id=owner_id,
        )
        # The service owns MongoDB reads and calculation orchestration.
        return analytics_service.analyse(
            simulation_id, owner, analysisStart, analysisEnd, startIndex, endIndex
        )
    except SimulationNotFoundError as error:
        raise HTTPException(404, str(error)) from error
    except AnalyticsServiceError as error:
        raise HTTPException(400, str(error)) from error
    except ValueError as error:
        raise HTTPException(422, str(error)) from error


@analytics_router.post("/{simulation_id}/analytics")
def selected_analytics(
    simulation_id: str,
    request: AnalyticsOptions,
    owner_type: str,
    owner_id: str,
):
    """Return only the requested analytics for one owned simulation."""
    try:
        owner = SimulationOwnerMiddleware.resolve(
            owner_type=owner_type,
            owner_id=owner_id,
        )
        return analytics_service.analyse(
            simulation_id,
            owner,
            start_index=request.startIndex,
            end_index=request.endIndex,
            selected=request.selected,
        )
    except SimulationNotFoundError as error:
        raise HTTPException(404, str(error)) from error
    except AnalyticsServiceError as error:
        raise HTTPException(422, str(error)) from error
    except ValueError as error:
        raise HTTPException(422, str(error)) from error


@analytics_router.post("/analytics/comparison")
def comparison(request: ComparisonRequest) -> ComparisonResponse:
    """Return baseline-relative charts and aggregate differences."""
    try:
        # The service treats the first selected simulation as the baseline.
        result = analytics_service.compare(
            SimulationOwnerMiddleware.resolve(
                owner_type=request.owner_type,
                owner_id=request.owner_id,
            ),
            request.simulationIds,
            request.analysisStart,
            request.analysisEnd,
            request.references,
        )
        # Validate the returned data before exposing the stable response shape.
        return ComparisonResponse.model_validate(result)
    except SimulationNotFoundError as error:
        raise HTTPException(404, str(error)) from error
    except AnalyticsServiceError as error:
        raise HTTPException(400, str(error)) from error
    except ValueError as error:
        raise HTTPException(422, str(error)) from error


@analytics_router.get("/{simulation_id}/results/latest")
def latest(
    simulation_id: str,
    owner_type: str,
    owner_id: str,
):
    """Return the latest timestep in a JSON-safe representation."""
    try:
        # This is a normal MongoDB read, not a Python-side SSE mechanism.
        owner = SimulationOwnerMiddleware.resolve(
            owner_type=owner_type,
            owner_id=owner_id,
        )
        timestep = analytics_service.latest_timestep(simulation_id, owner)
        return jsonable_encoder(timestep, custom_encoder={ObjectId: str})
    except SimulationNotFoundError as error:
        raise HTTPException(404, str(error)) from error
    except AnalyticsServiceError as error:
        raise HTTPException(400, str(error)) from error
    except ValueError as error:
        raise HTTPException(422, str(error)) from error
