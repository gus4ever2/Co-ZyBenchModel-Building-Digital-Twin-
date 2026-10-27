"""Generate, store and finalize one CARIBU/plantecophys plant response grid."""

from datetime import datetime, timezone
from pathlib import Path
from tempfile import TemporaryDirectory

from cosimulator.core.logger.logging import logger
from cosimulator.core.paths.project_paths import WORKSPACE_DIR
from cosimulator.enums.run_status import RunStatus
from cosimulator.plant.obj_caribu_plantecophys_grid import (
    PlantParameters,
    PlantSweepProgress,
    generate_obj_caribu_plantecophys_profiles,
    get_grid_config,
    normalise_obj_with_standard_mtl,
    write_standard_mtl,
)
from cosimulator.services.plant_profile_grid_service import (
    plant_profile_grid_service,
)


def generate_plant_grid(
    *,
    plant_id: str,
    plant_name: str,
    obj_path: Path,
    parameters: PlantParameters,
    grid_preset: str = "standard",
) -> None:
    """Build a grid in the child process and reflect every outcome in MongoDB."""
    # Import at runtime so this independent module does not create an import
    # cycle with the public PlantService facade.
    from cosimulator.services.plant_service import plant_service

    try:
        plant_service.update(
            plant_id=plant_id,
            fields={
                "status": RunStatus.RUNNING.value,
                "start_time": datetime.now(timezone.utc),
                "error": None,
            },
        )
        workspace = WORKSPACE_DIR / "plants" / plant_id
        model_directory = workspace / "model"
        model_directory.mkdir(parents=True, exist_ok=True)
        model_obj_path = model_directory / "plant_model.obj"
        mtl_path = model_directory / "plant_model.mtl"

        # Normalize every uploaded OBJ to the standard material names expected
        # by the ray-tracing and physiology pipeline.
        normalise_obj_with_standard_mtl(obj_path, model_obj_path, mtl_path.name)
        write_standard_mtl(mtl_path)
        plant_service.store_model_file(
            plant_id=plant_id,
            field="obj_file_id",
            path=model_obj_path,
            content_type="text/plain",
        )
        plant_service.store_model_file(
            plant_id=plant_id,
            field="mtl_file_id",
            path=mtl_path,
            content_type="text/plain",
        )

        last_progress = -1

        def report_progress(progress: PlantSweepProgress) -> None:
            """Persist progress while reserving the final 5% for MongoDB import."""
            nonlocal last_progress
            normalized = min(95, int(progress.percentage * 0.95))
            if normalized != last_progress:
                plant_service.update(
                    plant_id=plant_id,
                    fields={"progress": normalized},
                )
                last_progress = normalized

        with TemporaryDirectory(prefix=f"plant-{plant_id}-") as temporary_path:
            profile_path = generate_obj_caribu_plantecophys_profiles(
                obj_path=model_obj_path,
                output_directory=Path(temporary_path),
                parameters=parameters,
                config=get_grid_config(grid_preset),
                grid_preset=grid_preset,
                progress_callback=report_progress,
            )
            grid_point_count = plant_profile_grid_service.import_file(
                plant_id=plant_id,
                plant_name=plant_name,
                profile_path=profile_path,
            )

        plant_service.update(
            plant_id=plant_id,
            fields={
                "status": RunStatus.COMPLETED.value,
                "progress": 100,
                "profile_grid_point_count": grid_point_count,
                "end_time": datetime.now(timezone.utc),
            },
        )
    except Exception as error:
        plant_service.update(
            plant_id=plant_id,
            fields={
                "status": RunStatus.ERROR.value,
                "error": str(error),
                "end_time": datetime.now(timezone.utc),
            },
        )
        logger.exception("Plant generation %s failed", plant_id)
