"""The two small contracts shared by the analytics module.

Analytics are functions, not classes. They all receive ``AnalyticsInput`` and
return a specialised subclass of ``AnalyticsResult``.
"""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class AnalyticsInput(BaseModel):
    """One raw simulation timestep supplied to every analytic function."""

    simulation_id: str
    timestamp: datetime | None = None
    timestep_number: int | None = None
    results: dict[str, Any] = Field(default_factory=dict)


class AnalyticsResult(BaseModel):
    """Common output interface; each analytic adds only its own fields."""


class AnalyticsResponse(BaseModel):
    """Response returned by the analytics endpoint."""

    schemaVersion: int = 1
    simulationId: str
    results: dict[str, dict] = Field(default_factory=dict)
    metrics: dict[str, float | int | None] = Field(default_factory=dict)
    zones: dict[str, dict] = Field(default_factory=dict)
