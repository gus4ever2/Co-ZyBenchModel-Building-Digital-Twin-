package com.cozybench.simulation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

public record SimulationComparisonRequest(
        @Size(min = 2, max = 6) List<@NotBlank String> simulationIds,
        Instant analysisStart,
        Instant analysisEnd
) {
    public SimulationComparisonRequest {
        simulationIds = simulationIds == null ? List.of() : List.copyOf(simulationIds);
    }
}
