"""AirflowNetwork window-opening choices supplied in a simulation request."""

from enum import Enum

from pydantic import BaseModel, Field, model_validator


class WindowOpeningStrategy(str, Enum):
    """How temperature suitability is converted into an opening factor."""

    LINEAR = "linear"
    ON_OFF = "on_off"
    FIXED_PERCENTAGE = "fixed_percentage"


class OpenWindows(BaseModel):
    """CO2-triggered natural-ventilation control settings."""

    opening_strategy: WindowOpeningStrategy = Field(
        default=WindowOpeningStrategy.LINEAR,
    )
    temperature_margin_c: float = Field(ge=0)
    co2_threshold_ppm: float = Field(ge=400)
    opening_percentage: float | None = Field(default=None, ge=0, le=100, allow_inf_nan=False)

    @model_validator(mode="after")
    def require_fixed_percentage(self):
        if self.opening_strategy is WindowOpeningStrategy.FIXED_PERCENTAGE and self.opening_percentage is None:
            raise ValueError("opening_percentage is required for fixed_percentage control")
        return self
