from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "Co-Simulation API"
    app_version: str = "0.1.0"
    app_description: str = (
        "FastAPI server for EnergyPlus co-simulations"
    )
    debug: bool = False

    log_level: str = "INFO"

    mongo_uri: str = "mongodb://localhost:27017/"
    mongo_database: str = "cozybench"

    sse_timeout_seconds: int = 15

    energyplus_home: Path = Field(
        validation_alias="ENERGYPLUS_HOME",
    )

    host: str = "127.0.0.1"
    port: int = 5000

    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="COSIMULATOR_",
        extra="ignore",
    )

settings = Settings()
