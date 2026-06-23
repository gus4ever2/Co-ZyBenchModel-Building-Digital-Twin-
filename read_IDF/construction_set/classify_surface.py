def classify_surface(surface):
    surface_type = surface["Surface_Type"]
    outside_boundary = surface["Outside_Boundary_Condition"]

    if outside_boundary == "Outdoors":
        if surface_type == "Wall":
            return "exterior:wall"
        elif surface_type == "Floor":
            return "exterior:floor"
        elif surface_type == "Roof":
            return "exterior:roof"

    elif outside_boundary == "Ground":
        if surface_type == "Wall":
            return "ground:wall"
        elif surface_type == "Floor":
            return "ground:floor"
        elif surface_type == "Ceiling":
            return "ground:ceiling"
        elif surface_type == "Roof":
            return "ground:ceiling"

    elif outside_boundary == "Surface":
        if surface_type == "Wall":
            return "interior:wall"
        elif surface_type == "Floor":
            return "interior:floor"
        elif surface_type == "Ceiling":
            return "interior:ceiling"

    elif outside_boundary == "Adiabatic":
        return "unknown:adiabatic_surface"

    return "unknown:surface"