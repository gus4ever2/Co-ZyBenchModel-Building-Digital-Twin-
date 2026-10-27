"""Check the bundled library fields against the installed EnergyPlus 26.1 IDD."""

import json
import importlib
import os
import subprocess
import sys
from io import StringIO
from pathlib import Path
from types import SimpleNamespace

import pytest
from eppy.modeleditor import IDF

from cosimulator.database.dto.idf_preparation_dto import IdfObjectDTO, IdfPreparationDTO
from cosimulator.idf.construction_set.add_snapshot_objects import _add_idf_object
from cosimulator.idf.supported_idf_object_types import SUPPORTED_IDF_OBJECT_TYPES


IDD = Path("C:/EnergyPlusV26-1-0/Energy+.idd")
LIBRARY = Path("C:/Users/spili/Desktop/thesis/back_end/cozybench-backend/src/main/resources/data/library")


@pytest.mark.skipif(not IDD.exists() or not LIBRARY.exists(), reason="EnergyPlus 26.1 or library not installed")
def test_seed_objects_use_valid_energyplus_fields():
    if IDF.iddname is None:
        IDF.setiddname(str(IDD))
    assert Path(IDF.iddname) == IDD
    idf = IDF(StringIO("Version, 26.1;"))
    for filename in ("material.json", "construction.json"):
        for item in json.loads((LIBRARY / filename).read_text(encoding="utf-8")):
            object_type = item["type"].upper()
            assert object_type in SUPPORTED_IDF_OBJECT_TYPES, f"Unsupported type: {object_type}"
            assert object_type in idf.idfobjects, f"Missing IDD type: {object_type}"
            _add_idf_object(idf=idf, idf_object=IdfObjectDTO.model_validate(item))


@pytest.mark.skipif(not IDD.exists() or not LIBRARY.exists(), reason="EnergyPlus 26.1 or library not installed")
@pytest.mark.parametrize("with_plant_and_controls", [False, True])
def test_real_building_idf_with_predefined_library_set(monkeypatch, tmp_path, with_plant_and_controls):
    from cosimulator.schemas.simulation_context import SimulationContext

    module = importlib.import_module("cosimulator.idf.build_idf")
    if IDF.iddname is None:
        IDF.setiddname(str(IDD))
    assert Path(IDF.iddname) == IDD
    monkeypatch.setattr(module, "set_energyplus_idd", lambda: None)

    source_set = json.loads((LIBRARY / "constructionSet.json").read_text(encoding="utf-8"))[0]
    constructions = json.loads((LIBRARY / "construction.json").read_text(encoding="utf-8"))
    materials = json.loads((LIBRARY / "material.json").read_text(encoding="utf-8"))
    referenced_constructions = {value for key, value in source_set["properties"].items() if key != "Name" and value}
    constructions = [item for item in constructions if item["name"] in referenced_constructions]
    referenced_materials = {
        value for item in constructions for key, value in item["properties"].items()
        if key == "Outside_Layer" or key.startswith("Layer_")
    }
    materials = [item for item in materials if item["name"] in referenced_materials]
    if os.environ.get("COZYBENCH_TEST_HEAT_SOURCE") == "1":
        wall_name = source_set["properties"]["exteriorWall"]
        wall = next(item for item in constructions if item["name"] == wall_name)
        assert wall["properties"].get("Layer_2"), "heat source needs at least two layers"
        constructions.append({
            "name": wall_name + " Internal Heat Source",
            "type": "CONSTRUCTIONPROPERTY:INTERNALHEATSOURCE",
            "properties": {
                "Name": wall_name + " Internal Heat Source",
                "Construction_Name": wall_name,
                "Thermal_Source_Present_After_Layer_Number": "1",
                "Temperature_Calculation_Requested_After_Layer_Number": "1",
                "Dimensions_for_the_CTF_Calculation": "1",
                "Tube_Spacing": "0.15",
                "Two_Dimensional_Temperature_Calculation_Position": "0",
            },
        })
    dto = IdfPreparationDTO(
        construction_set=IdfObjectDTO.model_validate(source_set),
        idf_objects=[IdfObjectDTO.model_validate(item) for item in materials + constructions],
    )
    saved = {}
    monkeypatch.setattr(module, "save_temp_idf", lambda *, idf, simulation_id: saved.update(idf=idf))
    context_data = {"city": "paris", "construction_set": source_set["name"]}
    if with_plant_and_controls:
        profile_service = SimpleNamespace(get=lambda **_: {
            "schema_version": 5, "total_leaf_area_m2": 1.5, "panel_area_m2": 1.0,
        })
        monkeypatch.setitem(sys.modules, "cosimulator.services.plant_profile_grid_service",
                            SimpleNamespace(plant_profile_grid_service=profile_service))
        context_data.update({
            "plant_simulation": {"plant_id": "test", "plant_name": "test", "green_wall_size": "medium"},
            "co2_control": {"setpoint_ppm": 700},
            "open_windows": {"temperature_margin_c": 1, "co2_threshold_ppm": 700},
        })
    module.build_idf(
        simulation_id="test-no-file-written",
        idf_preparation_dto=dto,
        simulation_context=SimulationContext.model_validate(context_data),
    )
    surfaces = saved["idf"].idfobjects["BUILDINGSURFACE:DETAILED"]
    assert surfaces
    assert any(surface.Construction_Name == source_set["properties"]["exteriorWall"] for surface in surfaces)
    if with_plant_and_controls:
        assert any("Plant Latent Load" in obj.Name for obj in saved["idf"].idfobjects["OTHEREQUIPMENT"])
        assert saved["idf"].idfobjects["ZONECONTROL:CONTAMINANTCONTROLLER"]

    if os.environ.get("COZYBENCH_RUN_ENERGYPLUS_SMOKE") == "1":
        run_period = saved["idf"].idfobjects["RUNPERIOD"][0]
        run_period.End_Month = 1
        run_period.End_Day_of_Month = 1
        idf_path = tmp_path / "smoke.idf"
        saved["idf"].saveas(str(idf_path))
        weather = Path(__file__).resolve().parents[1] / "data/weather/paris/paris.epw"
        result = subprocess.run(
            [str(IDD.parent / "energyplus.exe"), "-d", str(tmp_path), "-w", str(weather), str(idf_path)],
            capture_output=True, text=True, timeout=180,
        )
        error_log = tmp_path / "eplusout.err"
        details = error_log.read_text(encoding="utf-8", errors="replace") if error_log.exists() else result.stderr
        assert result.returncode == 0, details[-12000:]
