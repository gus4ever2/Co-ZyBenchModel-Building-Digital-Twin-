package com.cozybench.building.idfobject.construction;

/** IDD fields in a layered Construction that contain material references, in outside-to-inside order. */
public enum ConstructionLayerProperty {
    OUTSIDE_LAYER("Outside_Layer"),
    LAYER_2("Layer_2"),
    LAYER_3("Layer_3"),
    LAYER_4("Layer_4"),
    LAYER_5("Layer_5"),
    LAYER_6("Layer_6"),
    LAYER_7("Layer_7"),
    LAYER_8("Layer_8"),
    LAYER_9("Layer_9"),
    LAYER_10("Layer_10");

    private final String fieldName;

    ConstructionLayerProperty(String fieldName) {
        this.fieldName = fieldName;
    }

    /** Returns the exact IDD property name used in the Mongo properties map. */
    public String fieldName() {
        return fieldName;
    }
}
