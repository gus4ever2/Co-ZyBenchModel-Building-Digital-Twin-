"""Internal maintenance endpoints called by the Spring scheduler."""

from fastapi import APIRouter

from cosimulator.services.maintenance_service import purge_user_data


maintenance_router = APIRouter(prefix="/maintenance", tags=["Maintenance"])


@maintenance_router.post("/cleanup-user-data")
def cleanup_user_data() -> dict[str, int]:
    """Remove user data when called by the Spring nightly scheduler."""
    return purge_user_data()
