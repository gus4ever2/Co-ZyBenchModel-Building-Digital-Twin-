package com.cozybench.simulation.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record ThermostatSetpointsRequest(
        @NotNull @DecimalMin("15.0") @DecimalMax("30.0") Double heatingSetpointC,
        @NotNull @DecimalMin("15.0") @DecimalMax("30.0") Double coolingSetpointC
) {
    @JsonIgnore
    @AssertTrue(message = "Heating setpoint must be lower than cooling setpoint")
    public boolean isHeatingBelowCooling() {
        return heatingSetpointC == null || coolingSetpointC == null
                || heatingSetpointC < coolingSetpointC;
    }
}
