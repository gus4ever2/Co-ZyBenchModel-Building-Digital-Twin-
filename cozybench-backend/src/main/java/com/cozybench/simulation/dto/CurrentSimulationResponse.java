package com.cozybench.simulation.dto;

import java.util.Map;
import java.util.Collections;
import java.util.LinkedHashMap;

public record CurrentSimulationResponse(
        SimulationSummaryResponse simulation,
        Map<String, Object> latestTimestep
) {
    public CurrentSimulationResponse {
        latestTimestep = latestTimestep == null
                ? Map.of()
                : Collections.unmodifiableMap(new LinkedHashMap<>(latestTimestep));
    }
}
