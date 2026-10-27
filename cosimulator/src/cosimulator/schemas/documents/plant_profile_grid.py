"""MongoDB document shape for a generated plant physiology response grid."""

from datetime import datetime, timezone
from typing import Any


def build_plant_profile_grid_document(
    *,
    plant_id: str,
    plant_name: str,
    profile: dict[str, Any],
) -> dict[str, Any]:
    """Link an inspectable generated response grid to its owning plant."""
    return {
        **profile,
        "plant_id": plant_id,
        "plant_name": plant_name,
        "recorded_at": datetime.now(timezone.utc),
    }
