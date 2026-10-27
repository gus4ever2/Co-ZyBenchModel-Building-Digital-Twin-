package com.cozybench.building.exception;

/** Signals that a requested component is missing or is outside the caller's workspace. */
public class BuildingComponentNotFoundException extends RuntimeException {
    public BuildingComponentNotFoundException(String message) {
        super(message);
    }
}
