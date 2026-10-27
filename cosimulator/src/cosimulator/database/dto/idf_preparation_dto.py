from typing import Any

from pydantic import BaseModel, ConfigDict


class IdfObjectDTO(BaseModel):
    model_config = ConfigDict(frozen=True)

    type: str
    name: str
    properties: dict[str, Any]


class IdfPreparationDTO(BaseModel):
    model_config = ConfigDict(frozen=True)

    idf_objects: list[IdfObjectDTO]
    construction_set: IdfObjectDTO


class SnapshotObject(IdfObjectDTO):
    id: str


class ConstructionSetSnapshot(BaseModel):
    """Complete, immutable inputs supplied by Spring before a run starts."""

    model_config = ConfigDict(frozen=True)

    constructionSet: SnapshotObject
    constructions: list[SnapshotObject]
    materials: list[SnapshotObject]
