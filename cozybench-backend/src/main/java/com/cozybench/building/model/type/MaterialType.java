package com.cozybench.building.model.type;

/** Supported opaque EnergyPlus material object types. */
public enum MaterialType implements ComponentType {
    MATERIAL("MATERIAL"),
    MATERIAL_NO_MASS("MATERIAL:NOMASS"),
    MATERIAL_AIR_GAP("MATERIAL:AIRGAP"),
    MATERIAL_INFRARED_TRANSPARENT("MATERIAL:INFRAREDTRANSPARENT"),
    MATERIAL_ROOF_VEGETATION("MATERIAL:ROOFVEGETATION");

    private final String eppyName;

    MaterialType(String eppyName) {
        this.eppyName = eppyName;
    }

    @Override
    public String eppyName() {
        return eppyName;
    }

    @Override
    public ComponentCategory category() {
        return ComponentCategory.MATERIAL;
    }
}
