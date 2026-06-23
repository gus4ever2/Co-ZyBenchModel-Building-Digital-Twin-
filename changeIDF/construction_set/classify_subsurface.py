def classify_subsurface(subsurface, parent_category: str) -> str:
    subsurface_type = getattr(subsurface, "Surface_Type")

    if subsurface_type == "Window":
        if parent_category == "exteriorWall":
            return "exteriorFixedWindow"
        elif parent_category == "interiorWall":
            return "interiorFixedWindow"
        elif parent_category == "exteriorRoof":
            return "exteriorSkylight"
        elif parent_category == "interiorCeiling":
            return "interiorFixedWindow"

    elif subsurface_type == "Door":
        if parent_category == "exteriorWall":
            return "exteriorDoor"
        elif parent_category == "interiorWall":
            return "interiorDoor"

    elif subsurface_type == "GlassDoor":
        if parent_category == "exteriorWall":
            return "exteriorGlassDoor"
        elif parent_category == "interiorWall":
            return "interiorGlassDoor"

    elif subsurface_type == "OverheadDoor":
        if parent_category == "exteriorWall":
            return "exteriorOverheadDoor"
        elif parent_category == "interiorWall":
            return "interiorOverheadDoor"

    elif subsurface_type == "TubularDaylightDome":
        return "exteriorTubularDaylightDome"

    elif subsurface_type == "TubularDaylightDiffuser":
        return "exteriorTubularDaylightDiffuser"

    return "unknownSubsurface"