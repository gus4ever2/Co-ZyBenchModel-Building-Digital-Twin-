"""Validated persistence result produced by the open-windows case study."""

from typing import ClassVar

from pydantic import BaseModel

from cosimulator.simulation.case_study.timestep_result import (
    CaseStudyTimestepResult,
)


class WindowOpeningValue(BaseModel):
    """Opening factor applied to one physical window during one timestep."""

    window_name: str
    opening_factor: float


class ZoneWindowOpeningValue(BaseModel):
    """All controlled window opening factors belonging to one thermal zone."""

    zone_name: str
    window_results: tuple[WindowOpeningValue, ...]


class OpenWindowsTimestepResult(CaseStudyTimestepResult):
    """MongoDB contribution owned exclusively by the window-control case study."""

    persistence_field_name: ClassVar[str] = "window_opening_results"

    window_opening_results: dict[str, ZoneWindowOpeningValue]
