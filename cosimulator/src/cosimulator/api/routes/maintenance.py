"""Internal maintenance endpoints called by the Spring scheduler."""

import hmac

from fastapi import APIRouter, Header, HTTPException

from cosimulator.core.config import settings
from cosimulator.services.maintenance_service import purge_user_data


maintenance_router = APIRouter(prefix="/maintenance", tags=["Maintenance"])


@maintenance_router.post("/cleanup-user-data")
def cleanup_user_data(
    x_internal_maintenance_token: str | None = Header(default=None),
) -> dict[str, int]:
    """Remove user data after authenticating the private Spring-to-Python call."""
    configured = settings.maintenance_token
    if not configured or not x_internal_maintenance_token or not hmac.compare_digest(
        x_internal_maintenance_token, configured
    ):
        raise HTTPException(status_code=403, detail="Maintenance call is not authorized")
    return purge_user_data()
