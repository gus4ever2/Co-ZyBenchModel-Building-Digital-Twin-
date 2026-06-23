def classify_subsurface(subsurface, parent_category):
    subsurface_type = subsurface["Surface_Type"]

    if subsurface_type == "Window":
        if parent_category == "exterior:wall":
            return "exterior:window"
        elif parent_category == "interior:wall":
            return "interior:window"
        elif parent_category == "exterior:roof":
            return "exterior:skylight"
        elif parent_category == "interior:ceiling":
            return "interior:window"

    elif subsurface_type == "Door":
        if parent_category == "exterior:wall":
            return "exterior:door"
        elif parent_category == "interior:wall":
            return "interior:door"

    elif subsurface_type == "GlassDoor":
        if parent_category == "exterior:wall":
            return "exterior:glass_door"
        elif parent_category == "interior:wall":
            return "interior:glass_door"

    elif subsurface_type == "OverheadDoor":
        if parent_category == "exterior:wall":
            return "exterior:overhead_door"
        elif parent_category == "interior:wall":
            return "interior:overhead_door"

    elif subsurface_type == "TubularDaylightDome":
        return "exterior:tubular_daylight_dome"

    elif subsurface_type == "TubularDaylightDiffuser":
        return "exterior:tubular_daylight_diffuser"

    return "unknown:subsurface"