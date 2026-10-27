"""Classify openings using their type and parent surface."""

def classify_subsurface(subsurface, parent_category: str) -> str:
    subsurface_type = getattr(subsurface, "Surface_Type")  # Opening type determines which construction-set slot to use.

    if subsurface_type == "Window":  # The parent distinguishes an exterior window, interior window or skylight.
        if parent_category == "exteriorWall":
            return "exteriorFixedWindow"
        elif parent_category == "interiorWall":
            return "interiorFixedWindow"
        elif parent_category == "exteriorRoof":
            return "exteriorSkylight"
        elif parent_category == "interiorCeiling":
            return "interiorFixedWindow"

    elif subsurface_type == "Door":  # Opaque doors use the exterior or interior door category.
        if parent_category == "exteriorWall":
            return "exteriorDoor"
        elif parent_category == "interiorWall":
            return "interiorDoor"

    elif subsurface_type == "GlassDoor":  # Glass doors have separate construction-set categories.
        if parent_category == "exteriorWall":
            return "exteriorGlassDoor"
        elif parent_category == "interiorWall":
            return "interiorGlassDoor"

    elif subsurface_type == "OverheadDoor":  # Overhead doors have separate exterior and interior slots.
        if parent_category == "exteriorWall":
            return "exteriorOverheadDoor"
        elif parent_category == "interiorWall":
            return "interiorOverheadDoor"

    elif subsurface_type == "TubularDaylightDome":
        return "exteriorTubularDaylightDome"

    elif subsurface_type == "TubularDaylightDiffuser":
        return "exteriorTubularDaylightDiffuser"

    return "unknownSubsurface"  # Leave unsupported opening types without a matching category.
