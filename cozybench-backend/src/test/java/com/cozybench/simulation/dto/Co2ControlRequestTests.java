package com.cozybench.simulation.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class Co2ControlRequestTests {

    @Test
    void acceptsSupportedSetpoints() {
        assertDoesNotThrow(() -> new Co2ControlRequest(500));
        assertDoesNotThrow(() -> new Co2ControlRequest(600));
        assertDoesNotThrow(() -> new Co2ControlRequest(700));
        assertDoesNotThrow(() -> new Co2ControlRequest(800));
        assertDoesNotThrow(() -> new Co2ControlRequest(900));
        assertDoesNotThrow(() -> new Co2ControlRequest(1000));
    }

    @Test
    void rejectsUnsupportedSetpoint() {
        assertThrows(
                IllegalArgumentException.class,
                () -> new Co2ControlRequest(550)
        );
    }
}
