package com.cozybench.building.idfobject.construction;

/** IDD fields in an internal heat-source object that point to its parent Construction. */
public enum InternalHeatSourceProperty {
    CONSTRUCTION_NAME("Construction_Name");

    private final String fieldName;

    InternalHeatSourceProperty(String fieldName) {
        this.fieldName = fieldName;
    }

    public String fieldName() {
        return fieldName;
    }
}
