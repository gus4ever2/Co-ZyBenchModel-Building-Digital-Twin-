package com.cozybench.simulation.dto;

import com.cozybench.simulation.model.WindowOpeningStrategy;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record OpenWindowsRequest(
        @NotNull WindowOpeningStrategy openingStrategy,
        @DecimalMin("0") double temperatureMarginC,
        @DecimalMin("400") double co2ThresholdPpm
) {
}
