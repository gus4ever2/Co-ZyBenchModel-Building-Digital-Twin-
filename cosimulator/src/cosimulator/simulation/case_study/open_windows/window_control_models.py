from dataclasses import dataclass


@dataclass(slots=True, frozen=True, kw_only=True)
class WindowActuatorHandle:
    """EnergyPlus handle addressing one physical window opening actuator."""

    window_name: str
    handle: int


@dataclass(slots=True, frozen=True, kw_only=True)
class ZoneWindowActuatorHandles:
    """All exterior-window actuators controlled together for one zone."""

    zone_name: str
    window_actuators: tuple[WindowActuatorHandle, ...]


@dataclass(slots=True, frozen=True, kw_only=True)
class WindowOpeningResult:
    """Opening factor actually sent to one window during one timestep."""

    window_name: str
    opening_factor: float


@dataclass(slots=True, frozen=True, kw_only=True)
class ZoneWindowOpeningResult:
    """Stored collection of per-window opening factors for one zone."""

    zone_name: str
    window_results: tuple[WindowOpeningResult, ...]
