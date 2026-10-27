from pathlib import Path
import subprocess

from cosimulator.idf.idf_file_operations import load_input_idf, set_energyplus_idd
from cosimulator.idf.registry import IDF_CONFIGURATORS
from cosimulator.idf.construction_set.construction_set import ConstructionSetConfigurator
from cosimulator.idf.construction_set.utils.remove_unused_constructions_and_materials import (
    remove_unused_constructions_and_materials,
)
from cosimulator.schemas.simulation_context import SimulationContext


def test_energyplus_design_days_after_preparation_and_cleanup(tmp_path):
    set_energyplus_idd()
    idf = load_input_idf()
    context = SimulationContext(city="andravida", construction_set="test")
    construction_set_index = next(
        index
        for index, configure in enumerate(IDF_CONFIGURATORS)
        if isinstance(configure, ConstructionSetConfigurator)
    )
    for configure in IDF_CONFIGURATORS[:construction_set_index]:
        configure(idf, context)
    remove_unused_constructions_and_materials(idf)
    input_file = tmp_path / "simulation.idf"
    idf.saveas(str(input_file))
    weather = Path(__file__).resolve().parents[1] / "data/weather/andravida/andravida.epw"
    executable = Path(r"C:\EnergyPlusV26-1-0\energyplus.exe")
    if not executable.is_file():
        import pytest
        pytest.skip("EnergyPlus 26.1 is not installed at the local test path")
    process = subprocess.run(
        [str(executable), "--design-day", "--weather", str(weather),
         "--output-directory", str(tmp_path), str(input_file)],
        capture_output=True, text=True, timeout=180,
    )
    errors = (tmp_path / "eplusout.err").read_text(errors="replace") if (tmp_path / "eplusout.err").exists() else ""
    assert process.returncode == 0, process.stdout + process.stderr + errors
