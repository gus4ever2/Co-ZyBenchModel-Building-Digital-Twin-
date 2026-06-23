def classify_surface(surface):
    surface_type = getattr(surface, "Surface_Type")
    outside_boundary = getattr(surface, "Outside_Boundary_Condition")

    if outside_boundary == "Outdoors":
        if surface_type == "Wall":
            return "exteriorWall"
        elif surface_type == "Floor":
            return "exteriorFloor"
        elif surface_type == "Roof":
            return "exteriorRoof"

    elif outside_boundary == "Ground":
        if surface_type == "Wall":
            return "groundContactWall"
        elif surface_type == "Floor":
            return "groundContactFloor"
        elif surface_type == "Ceiling":
            return "groundContactCeiling"
        elif surface_type == "Roof":
            return "groundContactCeiling"

    elif outside_boundary == "Surface":
        if surface_type == "Wall":
            return "interiorWall"
        elif surface_type == "Floor":
            return "interiorFloor"
        elif surface_type == "Ceiling":
            return "interiorCeiling"

    elif outside_boundary == "Adiabatic":
        return "adiabaticSurface"

    return "unknownSurface"