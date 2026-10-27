from fastapi import APIRouter

from cosimulator.api.routes.simulations import simulations_router
from cosimulator.api.routes.plants import plants_router
from cosimulator.api.routes.analytics import analytics_router

router = APIRouter()  # Root API router imported by the FastAPI application.

# Each feature owns its routes; this module only assembles the public API.
router.include_router(simulations_router)
router.include_router(plants_router)
router.include_router(analytics_router)

