package com.cozybench.simulation;

import com.cozybench.simulation.dto.ComponentSnapshot;
import com.cozybench.simulation.dto.ConstructionSetSnapshot;
import com.cozybench.simulation.dto.StartSimulationRequest;
import com.cozybench.simulation.model.ScenarioType;
import com.cozybench.simulation.service.CosimulatorSimulationClient;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import com.cozybench.simulation.dto.ThermostatSetpointsRequest;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SimulationStartHttpTests {
    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void sendsTheSnapshotAndOptionalThermostatSettings(boolean thermostatEnabled) throws Exception {
        var requestBody = new AtomicReference<String>();
        var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/simulations/start-simulation", exchange -> {
            requestBody.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            byte[] response = "{\"simulation_id\":\"example-id\"}".getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(201, response.length);
            try (var output = exchange.getResponseBody()) { output.write(response); }
        });
        server.start();
        try {
            var library = mock(com.cozybench.plant.service.DefaultPlantLibrary.class);
            when(library.prepare("user@example.com", "plant-id")).thenReturn("prepared-plant-id");
            var client = new CosimulatorSimulationClient("http://127.0.0.1:" + server.getAddress().getPort(), library);
            var set = new ComponentSnapshot("set-id", "Set", "construction_set", Map.of("Name", "Set"));
            var snapshot = new ConstructionSetSnapshot(set, List.of(), List.of());
            var request = new StartSimulationRequest("Test", ScenarioType.REFERENCE, "paris", "set-id",
                    thermostatEnabled ? new com.cozybench.simulation.dto.PlantSimulationRequest(
                            "plant-id", "Spathiphyllum",
                            com.cozybench.simulation.model.GreenWallSize.VERY_SMALL,
                            com.cozybench.simulation.model.PlantLightingLevel.HIGH,
                            com.cozybench.simulation.model.PlantCo2ExchangeMode.FULL_EXCHANGE) : null,
                    null, null,
                    thermostatEnabled ? new ThermostatSetpointsRequest(20.0, 26.0) : null,
                    Map.of());
            assertEquals("example-id", client.start("user@example.com", "Set", request, snapshot));
            assertTrue(requestBody.get().contains("\"construction_set_snapshot\""));
            assertTrue(requestBody.get().contains("\"constructionSet\""));
            assertTrue(requestBody.get().contains("\"id\":\"set-id\""));
            assertEquals(thermostatEnabled, requestBody.get().contains("thermostat_setpoints"));
            if (thermostatEnabled) {
                char quote = 34;
                assertTrue(requestBody.get().contains(quote + "green_wall_size" + quote + ":" + quote + "very_small" + quote));
                assertTrue(requestBody.get().contains(quote + "plant_id" + quote + ":" + quote + "prepared-plant-id" + quote));
                assertTrue(requestBody.get().contains(quote + "heating_setpoint_c" + quote + ":20.0"));
                assertTrue(requestBody.get().contains(quote + "cooling_setpoint_c" + quote + ":26.0"));
            }
        } finally {
            server.stop(0);
        }
    }
}
