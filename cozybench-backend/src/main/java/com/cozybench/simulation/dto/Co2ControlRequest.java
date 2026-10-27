package com.cozybench.simulation.dto;

import jakarta.validation.constraints.NotNull;

import java.util.Set;

public record Co2ControlRequest(
        @NotNull Integer setpointPpm
) {
    private static final Set<Integer> ALLOWED_SETPOINTS = Set.of(500, 600, 700, 800, 900, 1000);

    public Co2ControlRequest {
        if (setpointPpm != null && !ALLOWED_SETPOINTS.contains(setpointPpm)) {
            throw new IllegalArgumentException(
                    "CO2 setpoint must be one of 500, 600, 700, 800, 900, or 1000 ppm"
            );
        }
    }
}
