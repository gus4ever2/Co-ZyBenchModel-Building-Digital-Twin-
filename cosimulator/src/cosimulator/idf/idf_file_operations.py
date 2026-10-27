"""Load and save IDFs for the EnergyPlus installation selected by the user."""

from __future__ import annotations

import re
from pathlib import Path

from eppy.modeleditor import IDF

from cosimulator.core.logger.logging import logger
from cosimulator.core.paths.project_paths import (
    ENERGYPLUS_HOME,
    INPUT_FILE,
    WORKSPACE_DIR,
)


_IDF_VERSION_PATTERN = re.compile(
    r"^\s*Version\s*,\s*([0-9]+(?:\.[0-9]+)+)\s*;",
    re.IGNORECASE | re.MULTILINE,
)
_IDD_VERSION_PATTERN = re.compile(
    r"^!IDD_Version\s+([0-9]+(?:\.[0-9]+)+)", re.MULTILINE
)
_SUPPORTED_ENERGYPLUS_VERSION = "26.1"

# Version validation --------------------------------------------------------
# The template IDF and the installed IDD must use the same EnergyPlus schema.

def _major_minor(version: str) -> str:
    """Treat ``26.1`` and ``26.1.0`` as the same EnergyPlus version."""
    return ".".join(version.split(".")[:2])


def _read_version(*, file_path: Path, pattern: re.Pattern[str]) -> str:
    match = pattern.search(file_path.read_text(encoding="utf-8", errors="ignore"))  # Search the saved file for its declared EnergyPlus version.
    if match is None:
        raise RuntimeError(f"Could not identify the EnergyPlus version in: {file_path}")
    return _major_minor(match.group(1))


def get_energyplus_idd_file() -> Path:
    """Validate and return the IDD from ``ENERGYPLUS_HOME``.

    The application does not contain a hard-coded EnergyPlus path. The same
    source therefore works on Windows and Linux when the environment variable
    points to an EnergyPlus 26.1 installation.
    """
    if not ENERGYPLUS_HOME.is_dir():
        raise FileNotFoundError(
            "ENERGYPLUS_HOME does not point to an EnergyPlus installation: "
            f"{ENERGYPLUS_HOME}"
        )

    idd_file = ENERGYPLUS_HOME / "Energy+.idd"  # The IDD defines the EnergyPlus object types and accepted fields.
    if not idd_file.is_file():
        raise FileNotFoundError(f"EnergyPlus IDD was not found: {idd_file}")

    installed_version = _read_version(file_path=idd_file, pattern=_IDD_VERSION_PATTERN)  # Compare major and minor versions before handing the IDD to Eppy.
    if installed_version != _SUPPORTED_ENERGYPLUS_VERSION:
        raise RuntimeError(
            "Co-simulator requires EnergyPlus "
            f"{_SUPPORTED_ENERGYPLUS_VERSION}, but ENERGYPLUS_HOME contains "
            f"EnergyPlus {installed_version}."
        )
    return idd_file


def validate_input_idf_version() -> None:
    """Fail early when the input template differs from the active IDD version."""
    idd_file = get_energyplus_idd_file()
    idf_version = _read_version(file_path=INPUT_FILE, pattern=_IDF_VERSION_PATTERN)  # The input model must be compatible with the selected EnergyPlus version.
    if idf_version != _SUPPORTED_ENERGYPLUS_VERSION:
        raise RuntimeError(
            f"Input IDF is EnergyPlus {idf_version}. Convert {INPUT_FILE} to "
            f"EnergyPlus {_SUPPORTED_ENERGYPLUS_VERSION} before starting a simulation."
        )


def set_energyplus_idd() -> None:
    try:
        idd_file = get_energyplus_idd_file()
        IDF.setiddname(str(idd_file))  # Register the IDD so Eppy can interpret subsequent IDF objects.
        logger.info("Configured EnergyPlus IDD: `%s`", idd_file)
    except Exception as err:
        logger.exception("Failed to configure EnergyPlus IDD: %s", err)
        raise


def load_input_idf() -> IDF:
    try:
        validate_input_idf_version()
        idf = IDF(str(INPUT_FILE))  # Load a fresh in-memory model for this simulation.
        logger.info("Loaded input IDF: `%s`", INPUT_FILE)
        return idf
    except Exception as err:
        logger.exception("Failed to load input IDF `%s`: %s", INPUT_FILE, err)
        raise


def save_temp_idf(*, idf: IDF, simulation_id: str) -> None:
    simulation_workspace = WORKSPACE_DIR / simulation_id  # Each run gets its own directory, keyed by simulation ID.
    temp_idf = simulation_workspace / "temp.idf"  # This is the configured model later consumed by EnergyPlus.
    try:
        simulation_workspace.mkdir(parents=True, exist_ok=True)
        idf.saveas(str(temp_idf))  # Persist the mutated model without overwriting the original input.
        logger.info("Saved IDF: `%s`", temp_idf)
    except Exception as err:
        logger.exception("Failed to save IDF `%s`: %s", temp_idf, err)
        raise
