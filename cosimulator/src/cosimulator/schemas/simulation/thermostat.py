"""Occupied thermostat temperatures; schedule times and setbacks are not inputs."""

from pydantic import BaseModel, Field, model_validator


class ThermostatSetpoints(BaseModel):
    heating_setpoint_c: float = Field(ge=15, le=30, allow_inf_nan=False)
    cooling_setpoint_c: float = Field(ge=15, le=30, allow_inf_nan=False)

    @model_validator(mode="after")
    def heating_below_cooling(self) -> "ThermostatSetpoints":
        if self.heating_setpoint_c >= self.cooling_setpoint_c:
            raise ValueError("Heating setpoint must be lower than cooling setpoint.")
        return self
