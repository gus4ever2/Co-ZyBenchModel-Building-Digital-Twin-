package com.cozybench.building.model.type;

/** Supported fenestration material types; these share the editor's material category. */
public enum WindowMaterialType implements ComponentType {
    WINDOW_MATERIAL_SIMPLE_GLAZING_SYSTEM("WINDOWMATERIAL:SIMPLEGLAZINGSYSTEM"),
    WINDOW_MATERIAL_GLAZING("WINDOWMATERIAL:GLAZING"),
    WINDOW_MATERIAL_GAS("WINDOWMATERIAL:GAS"),
    WINDOW_MATERIAL_GAS_MIXTURE("WINDOWMATERIAL:GASMIXTURE"),
    WINDOW_MATERIAL_BLIND("WINDOWMATERIAL:BLIND"),
    WINDOW_MATERIAL_SCREEN("WINDOWMATERIAL:SCREEN"),
    WINDOW_MATERIAL_SHADE("WINDOWMATERIAL:SHADE"),
    WINDOW_MATERIAL_GLAZING_REFRACTION_EXTINCTION_METHOD(
            "WINDOWMATERIAL:GLAZING:REFRACTIONEXTINCTIONMETHOD"
    );

    private final String eppyName;

    WindowMaterialType(String eppyName) {
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
