"""AirflowNetwork window-opening choices supplied in a simulation request."""

from enum import Enum

from pydantic import BaseModel, Field


class WindowOpeningStrategy(str, Enum):
    """How temperature suitability is converted into an opening factor."""

    LINEAR = "linear"
    ON_OFF = "on_off"


class OpenWindows(BaseModel):
    """CO2-triggered natural-ventilation control settings."""

    opening_strategy: WindowOpeningStrategy = Field(
        default=WindowOpeningStrategy.LINEAR,
    )
    temperature_margin_c: float = Field(ge=0)
    co2_threshold_ppm: float = Field(ge=400)
