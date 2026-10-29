package com.cozybench.simulation.model;

public enum GreenWallSize {
    VERY_SMALL(0.05),
    SMALL(0.10),
    MEDIUM(0.30),
    LARGE(0.50),
    VERY_LARGE(0.75);

    private final double coverageRatio;

    GreenWallSize(double coverageRatio) {
        this.coverageRatio = coverageRatio;
    }

    public double coverageRatio() {
        return coverageRatio;
    }
}
