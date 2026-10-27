"""Typed definitions for EnergyPlus internal variables."""

from pydantic import BaseModel, ConfigDict


class InternalVariable(BaseModel):
    """One static EnergyPlus value read with an internal-variable handle."""

    model_config = ConfigDict(frozen=True)

    result_field: str
