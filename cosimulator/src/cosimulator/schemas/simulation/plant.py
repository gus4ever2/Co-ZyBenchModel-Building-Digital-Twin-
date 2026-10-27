"""Plant-specific choices supplied in a simulation request."""

from enum import Enum

from pydantic import BaseModel, Field


class GreenWallSize(str, Enum):
    """Coverage preset applied independently to every thermal zone."""

    SMALL = "small"
    MEDIUM = "medium"
    LARGE = "large"
    VERY_LARGE = "very_large"

    @property
    def coverage_ratio(self) -> float:
        """Return the wall-coverage ratio represented by this UI preset."""
        return {
            GreenWallSize.SMALL: 0.10,
            GreenWallSize.MEDIUM: 0.30,
            GreenWallSize.LARGE: 0.50,
            GreenWallSize.VERY_LARGE: 0.75,
        }[self]


class PlantLightingLevel(str, Enum):
    """Selectable daytime PPFD preset for an indoor plant simulation."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"

    @property
    def ppfd_umol_m2_s(self) -> float:
        """Return the photosynthetic photon flux density for the UI preset."""
        return {
            PlantLightingLevel.LOW: 50.0,
            PlantLightingLevel.MEDIUM: 100.0,
            PlantLightingLevel.HIGH: 200.0,
            PlantLightingLevel.VERY_HIGH: 300.0,
        }[self]


class PlantCO2ExchangeMode(str, Enum):
    """How the simulation applies the plant's net CO2 exchange."""

    FULL_EXCHANGE = "full_exchange"
    UPTAKE_ONLY = "uptake_only"


class PlantSimulation(BaseModel):
    """Plant selection, wall geometry and operation options for one run."""

    plant_id: str | None = None  # MongoDB plant-grid identity.
    plant_name: str = Field(min_length=1)  # Readable snapshot/audit label.
    green_wall_size: GreenWallSize
    coverage_percentage: float | None = Field(default=None, ge=0, le=100)
    lighting_level: PlantLightingLevel = PlantLightingLevel.MEDIUM
    exchange_mode: PlantCO2ExchangeMode = PlantCO2ExchangeMode.FULL_EXCHANGE
