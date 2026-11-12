"""Resolve a signed-in or guest owner for simulation operations."""

from dataclasses import dataclass
from enum import Enum


class OwnerType(str, Enum):
    USER = "USER"
    GUEST = "GUEST"


@dataclass(frozen=True)
class SimulationOwner:
    """Canonical owner identity stored on parent records."""

    owner_type: OwnerType
    owner_id: str

    def mongo_filter(self) -> dict[str, str]:
        """Return the exact MongoDB ownership predicate."""
        return {"owner_type": self.owner_type.value, "owner_id": self.owner_id}


class SimulationOwnerMiddleware:
    """Application layer, not FastAPI's built-in HTTP middleware."""

    @staticmethod
    def resolve(
        *, owner_type: str | OwnerType, owner_id: str
    ) -> SimulationOwner:
        try:
            raw_type = owner_type.value if isinstance(owner_type, OwnerType) else owner_type
            normalized_type = OwnerType(str(raw_type).strip().upper())
        except ValueError as error:
            raise ValueError("owner_type must be USER or GUEST") from error
        normalized_id = owner_id.strip()
        if not normalized_id:
            raise ValueError("owner_id is required")
        return SimulationOwner(normalized_type, normalized_id)
