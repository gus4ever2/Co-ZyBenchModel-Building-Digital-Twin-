package com.cozybench.simulation.dto;

import com.cozybench.simulation.model.ScenarioType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Map;
import java.util.Collections;
import java.util.LinkedHashMap;

public record StartSimulationRequest(
        @NotBlank String name,
        @NotNull ScenarioType scenarioType,
        @NotBlank String city,
        @NotBlank String constructionSet,
        @Valid PlantSimulationRequest plantSimulation,
        @Valid OpenWindowsRequest openWindows,
        @Valid Co2ControlRequest co2Control,
        Map<String, Object> customScenario
) {
    public StartSimulationRequest {
        customScenario = customScenario == null
                ? Map.of()
                : Collections.unmodifiableMap(new LinkedHashMap<>(customScenario));
    }
}
