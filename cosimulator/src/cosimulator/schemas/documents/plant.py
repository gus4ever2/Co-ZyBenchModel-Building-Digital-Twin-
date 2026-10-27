"""MongoDB document shape for one plant-generation process."""

from datetime import datetime, timezone
from typing import Any

from cosimulator.enums.run_status import RunStatus
from cosimulator.plant.obj_caribu_plantecophys_grid import PlantParameters


def build_base_plant_document(
    *,
    user_email: str,
    plant_name: str,
    parameters: PlantParameters,
    grid_preset: str = "standard",
) -> dict[str, Any]:
    """Create the initial PENDING plant record before a worker starts."""
    return {
        "user_email": user_email,
        "status": RunStatus.PENDING.value,
        "start_time": None,
        "end_time": None,
        "progress": 0,
        "parameters": {
            "plant_name": plant_name.strip().lower(),
            "model": "obj_caribu_plantecophys",
            "grid_preset": grid_preset,
            "parameters": {
                "reflectance": parameters.reflectance,
                "transmittance": parameters.transmittance,
                "vcmax": parameters.vcmax,
                "jmax": parameters.jmax,
                "rd": parameters.rd,
                "leaf_width_m": parameters.leaf_width_m,
                "wind_speed_m_s": parameters.wind_speed_m_s,
                "stomatal_ratio": parameters.stomatal_ratio,
                "leaf_absorptance": parameters.leaf_absorptance,
            },
        },
        "error": None,
        "obj_file_id": None,
        "mtl_file_id": None,
        "profile_grid_point_count": 0,
        "created_at": datetime.now(timezone.utc),
    }
