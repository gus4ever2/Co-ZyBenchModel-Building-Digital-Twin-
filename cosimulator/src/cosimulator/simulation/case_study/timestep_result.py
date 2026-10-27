"""Shared persistence contract for results produced by simulation case studies."""

from typing import Any, ClassVar

from pydantic import BaseModel, ConfigDict


class CaseStudyTimestepResult(BaseModel):
    """One validated, case-study-owned contribution to a timestep document.

    The runner treats all case studies uniformly through this small contract.
    Each subclass exposes exactly one top-level MongoDB field, which prevents
    arbitrary dictionaries and accidental field-name collisions.
    """

    model_config = ConfigDict(extra="forbid")

    persistence_field_name: ClassVar[str]

    def to_persistence_fields(self) -> dict[str, Any]:
        """Return the single validated field owned by this case study."""
        return {
            self.persistence_field_name: self.model_dump(mode="json"),
        }
