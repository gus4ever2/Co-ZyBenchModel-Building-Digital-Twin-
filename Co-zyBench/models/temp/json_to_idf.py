"""
Create IDF objects from JSON using Eppy, while skipping app-only objects
and avoiding invalid fields like End_Use_Subcategory on PEOPLE.

What it does:
1. Reads a JSON file with objects like:
   {
     "type": "LIGHTS",
     "name": "...",
     "properties": { ... }
   }

2. Skips app-only object types such as SCHEDULESET.

3. Creates valid Eppy objects with idf.newidfobject(type).

4. Sets only fields that exist in obj.fieldnames.

5. Prints unknown fields instead of crashing.

Usage:
    python json_to_idf.py input.idf output.idf objects.json Energy+.idd
"""

import json
import sys
from pathlib import Path
from typing import Any

from eppy.modeleditor import IDF


APP_ONLY_TYPES = {
    "SCHEDULESET",
    "SPACETYPE",
}


def load_json(json_path: str | Path) -> list[dict[str, Any]]:
    with open(json_path, "r", encoding="utf-8") as file:
        data = json.load(file)

    if not isinstance(data, list):
        raise ValueError("JSON root must be a list of objects.")

    return data


def set_valid_fields(eppy_object, properties: dict[str, Any]) -> None:
    """
    Set only valid Eppy fields.

    This prevents errors like:
        unknown field name

    Example:
        PEOPLE does not have End_Use_Subcategory,
        so it will be skipped if it appears.
    """
    valid_fields = set(eppy_object.fieldnames)

    for field_name, value in properties.items():
        if field_name == "key":
            continue

        if field_name not in valid_fields:
            print(f"[SKIP UNKNOWN FIELD] Object={eppy_object.key}, Field={field_name}")
            print(f"  Valid fields: {eppy_object.fieldnames}")
            continue

        setattr(eppy_object, field_name, value)


def create_objects_from_json(idf: IDF, objects: list[dict[str, Any]]) -> None:
    for obj in objects:
        object_type = obj.get("type")

        if not object_type:
            print(f"[SKIP] Missing type: {obj}")
            continue

        object_type = object_type.upper()

        if object_type in APP_ONLY_TYPES:
            print(f"[SKIP APP-ONLY TYPE] {object_type}")
            continue

        properties = obj.get("properties", {})

        if not isinstance(properties, dict):
            print(f"[SKIP] properties is not an object for {object_type}: {obj}")
            continue

        try:
            eppy_object = idf.newidfobject(object_type)
        except Exception as error:
            print(f"[SKIP INVALID OBJECT TYPE] {object_type}")
            print(f"  Error: {error}")
            continue

        set_valid_fields(eppy_object, properties)


def main() -> None:
    

    input_idf_path = r"C:/Users/spili/Desktop/Web-cozybench/Co-zyBench/models/temp/temp.idf"
    output_idf_path = r"C:/Users/spili/Desktop/Web-cozybench/Co-zyBench/models/temp/temp3.idf"
    json_path = r"spaceType.json"
    idd_path = r"C:/Users/spili/Desktop/EnergyPlusV22-2-0/Energy+.idd"

    IDF.setiddname(idd_path)

    idf = IDF(input_idf_path)
    objects = load_json(json_path)

    create_objects_from_json(idf, objects)

    idf.saveas(output_idf_path)

    print(f"Saved IDF: {output_idf_path}")


if __name__ == "__main__":
    main()
