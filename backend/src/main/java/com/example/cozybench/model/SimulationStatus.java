package com.example.cozybench.model;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum SimulationStatus {
    STARTED,
    COMPLETED,
    PENDING,
    ERROR,
    CANCELED,
    RUNNING;

    @JsonCreator
    public static SimulationStatus fromString(String status) {
        if (status != null) {
            switch (status.toUpperCase()) {
                case "STARTED" -> {
                    return STARTED;
                }
                case "COMPLETED" -> {
                    return COMPLETED;
                }
                case "PENDING" -> {
                    return PENDING;
                }
                case "ERROR" -> {
                    return ERROR;
                }
                case "CANCELED" -> {
                    return CANCELED;
                }
                case "RUNNING" -> {
                    return RUNNING;
                }
                default -> throw new IllegalArgumentException("Unknown status: " + status);
            }
        }
        return null; 
    }
}

