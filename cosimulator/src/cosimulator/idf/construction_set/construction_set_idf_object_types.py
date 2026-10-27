"""List supported construction and material object types."""

CONSTRUCTION_SET_IDF_OBJECT_TYPES:list[str] = [
    "MATERIAL",  # Ordinary layered opaque material.
    "MATERIAL:NOMASS",  # Opaque material specified by thermal resistance without thermal mass.
    "MATERIAL:AIRGAP",  # Air gap represented by thermal resistance.
    "MATERIAL:INFRAREDTRANSPARENT",  # Infrared-transparent material.
    "MATERIAL:ROOFVEGETATION",  # Vegetated roof material.

    "WINDOWMATERIAL:GLAZING",  # Glazing layer defined by optical and thermal properties.
    "WINDOWMATERIAL:GLAZING:REFRACTIONEXTINCTIONMETHOD",  # Glazing defined using refraction and extinction coefficients.
    "WINDOWMATERIAL:GLAZINGGROUP:THERMOCHROMIC",  # Group of glazing states with temperature-dependent properties.
    "WINDOWMATERIAL:SIMPLEGLAZINGSYSTEM",  # Simplified window specified by overall performance values.
    "WINDOWMATERIAL:GAS",  # Single gas layer in a window construction.
    "WINDOWMATERIAL:GASMIXTURE",  # Mixed gas layer in a window construction.
    "WINDOWMATERIAL:SHADE",  # Window shade layer.
    "WINDOWMATERIAL:SCREEN",  # Window screen layer.
    "WINDOWMATERIAL:BLIND",  # Window blind layer.

    "CONSTRUCTION",  # Layered construction referencing its material names.
    "CONSTRUCTIONPROPERTY:INTERNALHEATSOURCE",  # Heat-source properties referencing an existing construction.
    "CONSTRUCTION:CFACTORUNDERGROUNDWALL",  # Underground wall defined using a C-factor.
    "CONSTRUCTION:FFACTORGROUNDFLOOR",  # Ground floor defined using an F-factor.
    "CONSTRUCTION:AIRBOUNDARY"  # Air-boundary construction between zones.
]
