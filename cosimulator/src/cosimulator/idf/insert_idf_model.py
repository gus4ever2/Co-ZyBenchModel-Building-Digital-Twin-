"""Insert or update validated Pydantic models in an IDF."""

from eppy.modeleditor import IDF
from pydantic import BaseModel
from cosimulator.idf.utils.upsert_named_idf_object import upsert_named_idf_object


def insert_idf_model(idf: IDF, object_type: str, model: BaseModel) -> None:
    """Write a typed model; each caller owns its replacement policy."""
    idf.newidfobject(object_type, **model.model_dump(exclude_none=True))  # Write populated model fields using the corresponding EnergyPlus object type.


def upsert_idf_model(idf: IDF, object_type: str, model: BaseModel) -> None:
    """Create or update a named model without disturbing other IDF objects."""
    fields = model.model_dump(exclude_none=True)  # Exclude optional fields so existing values and IDD defaults remain untouched.
    name = fields.pop("Name")  # Separate the IDF name used to locate the object from its remaining fields.
    upsert_named_idf_object(idf, object_type, name, **fields)  # Update the matching object or create a new one when it is absent.
