"""Classify building surfaces for construction-set assignment."""

def classify_surface(surface):
    surface_type = getattr(surface, "Surface_Type")  # EnergyPlus surface type, such as Wall, Floor or Roof.
    outside_boundary = getattr(surface, "Outside_Boundary_Condition")  # The neighbouring environment determines exterior, ground or interior.

    if outside_boundary == "Outdoors":  # Use the exterior construction-set slots for outside-facing surfaces.
        if surface_type == "Wall":
            return "exteriorWall"
        elif surface_type == "Floor":
            return "exteriorFloor"
        elif surface_type == "Roof":
            return "exteriorRoof"

    elif outside_boundary == "Ground":  # Select ground-contact slots for surfaces touching the ground.
        if surface_type == "Wall":
            return "groundContactWall"
        elif surface_type == "Floor":
            return "groundContactFloor"
        elif surface_type == "Ceiling":
            return "groundContactCeiling"
        elif surface_type == "Roof":
            return "groundContactCeiling"

    elif outside_boundary == "Surface":  # A neighbouring surface represents an interior boundary.
        if surface_type == "Wall":
            return "interiorWall"
        elif surface_type == "Floor":
            return "interiorFloor"
        elif surface_type == "Ceiling":
            return "interiorCeiling"

    elif outside_boundary == "Adiabatic":  # Adiabatic surfaces have their own construction-set slot.
        return "adiabaticSurface"

    return "unknownSurface"  # Unrecognized combinations do not match any configured category.
