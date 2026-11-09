"""Resolve the signed-in or guest owner for simulation operations."""

from dataclasses import dataclass


@dataclass(frozen=True)
class SimulationOwner:
    """The mutually exclusive owner identity attached to a simulation."""

    user_email: str | None = None
    guest_session_id: str | None = None

    @property
    def field_name(self) -> str:
        return "user_email" if self.user_email is not None else "guest_session_id"

    @property
    def value(self) -> str:
        value = self.user_email or self.guest_session_id
        if value is None:
            raise ValueError("Simulation owner has not been resolved")
        return value

    def mongo_filter(self) -> dict[str, str]:
        """Return the MongoDB ownership predicate for this simulation."""
        return {self.field_name: self.value}


class SimulationOwnerMiddleware:
    """Application layer, not FastAPI's built-in HTTP middleware."""

    @staticmethod
    def resolve(
        *, user_email: str | None, guest_session_id: str | None
    ) -> SimulationOwner:
        user_email = user_email.strip() if user_email is not None else None
        guest_session_id = (
            guest_session_id.strip() if guest_session_id is not None else None
        )
        user_email = user_email or None
        guest_session_id = guest_session_id or None

        if (user_email is None) == (guest_session_id is None):
            raise ValueError(
                "Provide exactly one owner: user_email or guest_session_id"
            )

        return SimulationOwner(
            user_email=user_email,
            guest_session_id=guest_session_id,
        )
