package com.cozybench.simulation.dto;

import com.cozybench.simulation.model.ScenarioType;

import java.time.Instant;
import java.util.Map;
import java.util.Collections;
import java.util.LinkedHashMap;

public record SimulationSummaryResponse(
        String id,
        String name,
        ScenarioType scenarioType,
        String status,
        int progress,
        String city,
        String constructionSetName,
        PlantSimulationRequest plantSimulation,
        OpenWindowsRequest openWindows,
        Co2ControlRequest co2Control,
        Instant requestedAt,
        Instant startedAt,
        Instant completedAt,
        String resultStartTimestamp,
        String resultEndTimestamp,
        long timestepCount,
        String error,
        ConstructionSetSnapshot constructionSet,
        Map<String, Object> customScenario
) {
    public SimulationSummaryResponse {
        customScenario = customScenario == null
                ? Map.of()
                : Collections.unmodifiableMap(new LinkedHashMap<>(customScenario));
    }
}
