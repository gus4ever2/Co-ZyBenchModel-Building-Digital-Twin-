from bson import ObjectId
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.encoders import jsonable_encoder
from fastapi.responses import Response

from cosimulator.core.paths.project_paths import WORKSPACE_DIR
from cosimulator.plant.obj_caribu_plantecophys_grid import PlantParameters
from cosimulator.services.plant_service import (
    launch_plant_generation,
    plant_service,
)
from cosimulator.services.plant_profile_grid_service import plant_profile_grid_service


plants_router = APIRouter(
    # Plant-library and user-created plant endpoints share this resource path.
    prefix="/plants",
    tags=["Plants"],  # Label used by OpenAPI and the generated API page.
)


def _plant_response(document: dict) -> dict:
    """Make one plant document JSON-safe and add grid-derived display data."""
    response = jsonable_encoder(
        document,
        custom_encoder={ObjectId: str},
    )
    # Leaf area is generated with the response grid, not stored on the plant.
    profile_grid = plant_profile_grid_service.get(plant_id=str(document["_id"]))
    if profile_grid is not None:
        response["total_leaf_area_m2"] = profile_grid.get("total_leaf_area_m2")
    return response


@plants_router.post("", status_code=201)
async def create_plant(
    user_email: str = Form(...),
    plant_name: str = Form(...),
    reflectance: float = Form(...),
    transmittance: float = Form(...),
    vcmax: float = Form(...),
    jmax: float = Form(...),
    rd: float = Form(...),
    leaf_width_m: float = Form(0.05),
    wind_speed_m_s: float = Form(0.2),
    stomatal_ratio: float = Form(1.0),
    leaf_absorptance: float = Form(0.86),
    grid_preset: str = Form("standard"),
    obj_file: UploadFile = File(...),
) -> dict[str, str]:
    """Create a pending plant, retain the OBJ and start grid generation."""
    # A normalized name is used for uniqueness checks and library display.
    normalized_name = plant_name.strip().lower()
    if not normalized_name:
        raise HTTPException(status_code=422, detail="plant_name is required")

    # Optical and physiological inputs stored with the generated plant grid.
    parameters = PlantParameters(
        reflectance=reflectance,
        transmittance=transmittance,
        vcmax=vcmax,
        jmax=jmax,
        rd=rd,
        leaf_width_m=leaf_width_m,
        wind_speed_m_s=wind_speed_m_s,
        stomatal_ratio=stomatal_ratio,
        leaf_absorptance=leaf_absorptance,
    )
    try:
        parameters.validate()
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    try:
        # Validate at request time so an invalid preset never creates a
        # permanently pending plant document.
        from cosimulator.plant.obj_caribu_plantecophys_grid import get_grid_config

        get_grid_config(grid_preset)
        plant_id = plant_service.initialize_process(
            user_email=user_email,
            plant_name=normalized_name,
            parameters=parameters,
            grid_preset=grid_preset,
        )
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    # The worker receives a local OBJ path; GridFS persistence happens later.
    workspace = WORKSPACE_DIR / "plants" / plant_id / "input"
    workspace.mkdir(parents=True, exist_ok=True)
    obj_path = workspace / "plant.obj"

    try:
        if not (obj_file.filename or "").lower().endswith(".obj"):
            raise ValueError("The plant model must be an OBJ file")
        # Read once so a failed upload cannot leave an empty worker input file.
        obj_path.write_bytes(await obj_file.read())
        if obj_path.stat().st_size == 0:
            raise ValueError("Uploaded OBJ file must not be empty")
    except Exception as error:
        # A visible ERROR state prevents a permanently pending UI entry.
        plant_service.update(
            plant_id=plant_id,
            fields={"status": "ERROR", "error": str(error)},
        )
        raise HTTPException(status_code=400, detail=str(error)) from error
    finally:
        await obj_file.close()

    # Generation is asynchronous; the frontend follows status through Spring.
    launch_plant_generation(
        plant_id=plant_id,
        plant_name=normalized_name,
        obj_path=obj_path,
        parameters=parameters,
        grid_preset=grid_preset,
    )
    return {"plant_id": plant_id}


@plants_router.get("")
def list_plants(user_email: str) -> dict:
    """Return plants owned by the user with response-grid metadata."""
    documents = plant_service.list_for_user(user_email=user_email)
    return {
        "count": len(documents),
        "plants": [_plant_response(document) for document in documents],
    }


@plants_router.get("/{plant_id}")
def get_plant(plant_id: str, user_email: str) -> dict:
    """Return one owned plant after validating its MongoDB identifier."""
    try:
        document = plant_service.get(
            plant_id=plant_id,
            user_email=user_email,
        )
    except Exception as error:
        raise HTTPException(status_code=400, detail="Invalid plant_id") from error
    if document is None:
        raise HTTPException(status_code=404, detail="Plant not found")
    return _plant_response(document)


@plants_router.get("/{plant_id}/export")
def export_plant(plant_id: str, user_email: str) -> dict:
    """Export the plant and its grid after checking ownership."""
    try:
        plant = plant_service.get(plant_id=plant_id, user_email=user_email)
    except Exception as error:
        raise HTTPException(status_code=400, detail="Invalid plant_id") from error
    if plant is None:
        raise HTTPException(status_code=404, detail="Plant not found")

    # The response grid is a separate collection keyed by the plant ID.
    grid = plant_profile_grid_service.get(plant_id=plant_id)
    if grid is None:
        raise HTTPException(status_code=404, detail="Plant grid not found")
    return jsonable_encoder(
        {"plant": plant, "grid": grid},
        custom_encoder={ObjectId: str},
    )


@plants_router.post("/{plant_id}/regenerate", status_code=202)
def regenerate_plant_grid(
    plant_id: str,
    user_email: str = Form(...),
    grid_preset: str | None = Form(None),
) -> dict[str, str]:
    """Regenerate an existing plant's PhotosynEB response grid.

    The endpoint reuses the OBJ already stored in GridFS and preserves the
    plant ID.  It is deliberately separate from ``POST /plants`` so the
    frontend can update a grid schema without uploading the same model again.
    """
    try:
        plant = plant_service.get(plant_id=plant_id, user_email=user_email)
    except Exception as error:
        raise HTTPException(status_code=400, detail="Invalid plant_id") from error
    if plant is None:
        raise HTTPException(status_code=404, detail="Plant not found")
    if plant.get("status") in {"PENDING", "RUNNING"}:
        raise HTTPException(
            status_code=409,
            detail="Plant grid generation is already running",
        )

    # Reuse the original physical parameters for the existing plant identity.
    parameter_values = (plant.get("parameters") or {}).get("parameters") or {}
    selected_preset = grid_preset or (plant.get("parameters") or {}).get(
        "grid_preset", "production"
    )
    try:
        parameters = PlantParameters(**parameter_values)
        parameters.validate()
        from cosimulator.plant.obj_caribu_plantecophys_grid import get_grid_config

        get_grid_config(selected_preset)
    except (TypeError, ValueError) as error:
        raise HTTPException(
            status_code=422,
            detail=f"Stored plant parameters are invalid: {error}",
        ) from error

    try:
        # Restore the already owned OBJ from GridFS into a worker workspace.
        stored_obj = plant_service.read_model_file(
            plant_id=plant_id,
            user_email=user_email,
            field="obj_file_id",
        )
        if stored_obj is None:
            raise FileNotFoundError("Stored OBJ model was not found")
        workspace = WORKSPACE_DIR / "plants" / plant_id / "input"
        workspace.mkdir(parents=True, exist_ok=True)
        obj_path = workspace / "regeneration-source.obj"
        obj_path.write_bytes(stored_obj.read())
    except Exception as error:
        raise HTTPException(
            status_code=409,
            detail=f"Could not restore the stored OBJ model: {error}",
        ) from error

    plant_name = str((plant.get("parameters") or {}).get("plant_name") or "")
    if not plant_name:
        raise HTTPException(status_code=422, detail="Stored plant name is missing")
    launch_plant_generation(
        plant_id=plant_id,
        plant_name=plant_name,
        obj_path=obj_path,
        parameters=parameters,
        grid_preset=selected_preset,
    )
    return {"plant_id": plant_id, "status": "PENDING"}


def _send_model_file(
    *, plant_id: str, user_email: str, field: str, media_type: str
) -> Response:
    """Return one owned OBJ/MTL GridFS file with an inline filename."""
    try:
        grid_file = plant_service.read_model_file(
            plant_id=plant_id,
            user_email=user_email,
            field=field,
        )
    except Exception as error:
        raise HTTPException(status_code=400, detail="Invalid plant_id") from error
    if grid_file is None:
        raise HTTPException(status_code=404, detail="Plant model file not found")
    return Response(
        content=grid_file.read(),
        media_type=media_type,
        headers={
            "Content-Disposition": f'inline; filename="{grid_file.filename}"'
        },
    )


@plants_router.get("/{plant_id}/obj")
def get_plant_obj(plant_id: str, user_email: str) -> Response:
    """Return OBJ geometry for the 3D preview renderer."""
    return _send_model_file(
        plant_id=plant_id,
        user_email=user_email,
        field="obj_file_id",
        media_type="text/plain",
    )


@plants_router.get("/{plant_id}/mtl")
def get_plant_mtl(plant_id: str, user_email: str) -> Response:
    """Return the MTL material file referenced by the OBJ geometry."""
    return _send_model_file(
        plant_id=plant_id,
        user_email=user_email,
        field="mtl_file_id",
        media_type="text/plain",
    )


@plants_router.delete("/{plant_id}", status_code=204)
def delete_plant(plant_id: str, user_email: str) -> Response:
    """Delete an owned plant and related grid/files through the service."""
    try:
        deleted = plant_service.delete(
            plant_id=plant_id,
            user_email=user_email,
        )
    except RuntimeError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=400, detail="Invalid plant_id") from error
    if not deleted:
        raise HTTPException(status_code=404, detail="Plant not found")
    return Response(status_code=204)
