package com.cozybench.simulation.dto;

import com.cozybench.simulation.model.GreenWallSize;
import com.cozybench.simulation.model.PlantLightingLevel;
import com.cozybench.simulation.model.PlantCo2ExchangeMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PlantSimulationRequest(
        String plantId,
        @NotBlank String plantName,
        @NotNull GreenWallSize greenWallSize,
        @NotNull PlantLightingLevel lightingLevel,
        @NotNull PlantCo2ExchangeMode exchangeMode
) {
}
