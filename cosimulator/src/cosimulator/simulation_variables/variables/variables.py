"""Typed definitions for EnergyPlus ``Output:Variable`` requests."""

from enum import Enum

from pydantic import BaseModel, ConfigDict


class OutputVariableKeyType(str, Enum):
    """The EnergyPlus key used when a variable is requested or read."""

    ZONE = "ZONE"
    PEOPLE = "PEOPLE"
    ENVIRONMENT = "ENVIRONMENT"
    AIR_LOOP = "AIR_LOOP"
    SYSTEM_NODE = "SYSTEM_NODE"


class OutputVariable(BaseModel):
    """One simulator result backed by an EnergyPlus output variable."""

    model_config = ConfigDict(frozen=True)

    result_field: str
    is_zone_result: bool
    key_type: OutputVariableKeyType
    key_suffix: str | None = None
