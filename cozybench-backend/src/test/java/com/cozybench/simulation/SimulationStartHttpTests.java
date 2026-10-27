package com.cozybench.simulation;

import com.cozybench.simulation.dto.ComponentSnapshot;
import com.cozybench.simulation.dto.ConstructionSetSnapshot;
import com.cozybench.simulation.dto.StartSimulationRequest;
import com.cozybench.simulation.model.ScenarioType;
import com.cozybench.simulation.service.CosimulatorSimulationClient;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.Test;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;

class SimulationStartHttpTests {
    @Test
    void sendsTheSnapshotInTheFastApiRequest() throws Exception {
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
            var client = new CosimulatorSimulationClient("http://127.0.0.1:" + server.getAddress().getPort(), null);
            var set = new ComponentSnapshot("set-id", "Set", "construction_set", Map.of("Name", "Set"));
            var snapshot = new ConstructionSetSnapshot(set, List.of(), List.of());
            var request = new StartSimulationRequest("Test", ScenarioType.REFERENCE, "paris", "set-id",
                    null, null, null, Map.of());
            assertEquals("example-id", client.start("user@example.com", "Set", request, snapshot));
            assertTrue(requestBody.get().contains("\"construction_set_snapshot\""));
            assertTrue(requestBody.get().contains("\"constructionSet\""));
            assertTrue(requestBody.get().contains("\"id\":\"set-id\""));
        } finally {
            server.stop(0);
        }
    }
}
