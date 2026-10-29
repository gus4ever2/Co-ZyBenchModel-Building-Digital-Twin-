import os
from pathlib import Path

from cosimulator.core.config import settings


PROJECT_ROOT = Path(
    os.environ.get("COSIMULATOR_PROJECT_ROOT", Path(__file__).resolve().parents[4])
).resolve()


ENERGYPLUS_HOME = settings.energyplus_home


DATA_DIR = PROJECT_ROOT / "data"
INPUT_DIR = DATA_DIR / "input"
OUTPUT_DIR = DATA_DIR / "output"
WEATHER_DIR = DATA_DIR / "weather"
WORKSPACE_DIR = DATA_DIR / "workspace"
LOG_DIR = PROJECT_ROOT / "logs"
PLANT_PROFILES_DIR = OUTPUT_DIR / "plant_profiles"


INPUT_FILE = INPUT_DIR / "in.idf"
LOG_FILE = LOG_DIR / "app.log"



def create_project_directories() -> None:
    directories = [
        DATA_DIR,
        INPUT_DIR,
        OUTPUT_DIR,
        WEATHER_DIR,
        WORKSPACE_DIR,
        LOG_DIR,
    ]

    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)
