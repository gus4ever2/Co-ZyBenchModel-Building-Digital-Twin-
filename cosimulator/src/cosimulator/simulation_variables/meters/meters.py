"""Typed meter definition plus in-memory meter handles and values."""

from dataclasses import dataclass

from pydantic import BaseModel, ConfigDict


class Meter(BaseModel):
    """One EnergyPlus ``Output:Meter`` exposed in simulation results."""

    model_config = ConfigDict(frozen=True)

    result_field: str

@dataclass(slots=True,  kw_only=True)
class MeterHandles:
    heating_electricity_j: int = -1
    cooling_electricity_j: int = -1
    hvac_electricity_j: int = -1

@dataclass(slots=True,  kw_only=True)
class MeterValues:
    heating_electricity_j: float = 0.0
    cooling_electricity_j: float = 0.0
    hvac_electricity_j: float = 0.0
