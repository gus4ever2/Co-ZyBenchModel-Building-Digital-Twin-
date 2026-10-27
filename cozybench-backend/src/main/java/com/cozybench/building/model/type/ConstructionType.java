package com.cozybench.building.model.type;

/** Supported EnergyPlus construction and construction-property object types. */
public enum ConstructionType implements ComponentType {
    CONSTRUCTION("CONSTRUCTION"),
    CONSTRUCTION_AIR_BOUNDARY("CONSTRUCTION:AIRBOUNDARY"),
    CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE(
            "CONSTRUCTIONPROPERTY:INTERNALHEATSOURCE"
    ),
    CONSTRUCTION_CFACTOR_UNDERGROUND_WALL(
            "CONSTRUCTION:CFACTORUNDERGROUNDWALL"
    ),
    CONSTRUCTION_FFACTOR_GROUND_FLOOR(
            "CONSTRUCTION:FFACTORGROUNDFLOOR"
    );

    private final String eppyName;

    ConstructionType(String eppyName) {
        this.eppyName = eppyName;
    }

    @Override
    public String eppyName() {
        return eppyName;
    }

    @Override
    public ComponentCategory category() {
        return ComponentCategory.CONSTRUCTION;
    }
}
