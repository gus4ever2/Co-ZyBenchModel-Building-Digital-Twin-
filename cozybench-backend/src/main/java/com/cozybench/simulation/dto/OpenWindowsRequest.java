package com.cozybench.simulation.dto;

import com.cozybench.simulation.model.WindowOpeningStrategy;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record OpenWindowsRequest(
        @NotNull WindowOpeningStrategy openingStrategy,
        @DecimalMin("0") double temperatureMarginC,
        @DecimalMin("400") double co2ThresholdPpm,
        @DecimalMin("0") @DecimalMax("100") Double openingPercentage
) {
    @JsonIgnore
    @AssertTrue(message = "Fixed percentage requires a finite openingPercentage from 0 to 100")
    public boolean isOpeningPercentageValid() {
        return openingPercentage == null
                ? openingStrategy != WindowOpeningStrategy.FIXED_PERCENTAGE
                : Double.isFinite(openingPercentage) && openingPercentage >= 0 && openingPercentage <= 100;
    }
}
