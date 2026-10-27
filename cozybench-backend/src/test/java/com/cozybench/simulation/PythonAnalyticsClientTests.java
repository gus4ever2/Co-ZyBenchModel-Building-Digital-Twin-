package com.cozybench.simulation;

import com.cozybench.simulation.service.CosimulatorSimulationClient;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.Test;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

class PythonAnalyticsClientTests {
    @Test
    void analyticsArePassedThroughIncludingNulls() throws Exception {
        var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/simulations/test/analytics", exchange -> {
            byte[] response = "{\"simulationId\":\"test\",\"metrics\":{\"averageCo2Ppm\":null,\"totalHvacKwh\":1.5}}".getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, response.length);
            try (var output = exchange.getResponseBody()) { output.write(response); }
        });
        server.start();
        try {
            var client = new CosimulatorSimulationClient("http://127.0.0.1:" + server.getAddress().getPort(), null);
            var result = client.analytics("owner@example.com", "test", 0, null);
            var metrics = (Map<?, ?>) result.get("metrics");
            assertTrue(metrics.containsKey("averageCo2Ppm"));
            assertNull(metrics.get("averageCo2Ppm"));
            assertEquals(1.5, metrics.get("totalHvacKwh"));
        } finally { server.stop(0); }
    }
}
