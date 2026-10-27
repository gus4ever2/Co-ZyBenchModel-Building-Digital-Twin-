package com.cozybench.simulation.dto;

import java.util.List;
import java.util.Map;

public record SimulationResultsResponse(
        String simulationId,
        int offset,
        Integer limit,
        long total,
        int returned,
        List<Map<String, Object>> timesteps
) {
    public SimulationResultsResponse {
        timesteps = timesteps == null ? List.of() : List.copyOf(timesteps);
    }
}
