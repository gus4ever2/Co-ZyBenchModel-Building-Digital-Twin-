package com.cozybench.simulation;

import com.cozybench.simulation.dto.ThermostatSetpointsRequest;
import jakarta.validation.Validation;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ThermostatSetpointsTests {
    @Test
    void validatesRequiredValuesRangeAndHeatingCoolingOrder() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();
            assertTrue(validator.validate(new ThermostatSetpointsRequest(21.0, 26.0)).isEmpty());
            assertTrue(validator.validate(new ThermostatSetpointsRequest(21.0, 30.0)).isEmpty());
            for (var invalid : java.util.List.of(
                    new ThermostatSetpointsRequest(26.0, 25.0),
                    new ThermostatSetpointsRequest(24.0, 24.0),
                    new ThermostatSetpointsRequest(14.9, 24.0),
                    new ThermostatSetpointsRequest(21.0, 30.1),
                    new ThermostatSetpointsRequest(null, 24.0),
                    new ThermostatSetpointsRequest(21.0, null),
                    new ThermostatSetpointsRequest(Double.NaN, 24.0),
                    new ThermostatSetpointsRequest(21.0, Double.POSITIVE_INFINITY))) {
                assertFalse(validator.validate(invalid).isEmpty(), invalid.toString());
            }
        }
    }
}
