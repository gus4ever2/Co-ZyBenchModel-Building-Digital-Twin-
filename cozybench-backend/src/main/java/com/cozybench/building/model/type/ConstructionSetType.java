package com.cozybench.building.model.type;

/** API and persistence identity for the application-level construction set. */
public enum ConstructionSetType implements ComponentType {
    CONSTRUCTION_SET("construction_set");

    private final String eppyName;

    ConstructionSetType(String eppyName) {
        this.eppyName = eppyName;
    }

    @Override
    public String eppyName() {
        return eppyName;
    }

    @Override
    public ComponentCategory category() {
        return ComponentCategory.CONSTRUCTION_SET;
    }
}
