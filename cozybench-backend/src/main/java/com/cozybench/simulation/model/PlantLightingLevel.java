package com.cozybench.simulation.model;

public enum PlantLightingLevel {
    LOW(50.0),
    MEDIUM(100.0),
    HIGH(200.0),
    VERY_HIGH(300.0);

    private final double ppfdUmolM2S;

    PlantLightingLevel(double ppfdUmolM2S) {
        this.ppfdUmolM2S = ppfdUmolM2S;
    }

    public double ppfdUmolM2S() {
        return ppfdUmolM2S;
    }
}
