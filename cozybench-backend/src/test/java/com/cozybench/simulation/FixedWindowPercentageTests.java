package com.cozybench.simulation;

import com.cozybench.simulation.dto.*;
import com.cozybench.simulation.model.*;
import com.cozybench.simulation.service.CosimulatorSimulationClient;
import com.cozybench.plant.service.DefaultPlantLibrary;
import com.sun.net.httpserver.HttpServer;
import jakarta.validation.Validation;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class FixedWindowPercentageTests {
    @ParameterizedTest
    @ValueSource(doubles={0.0,0.1,10.0,100.0})
    void sendsTheUserPercentageWithoutConvertingItInJava(double percentage) throws Exception {
        var body=new AtomicReference<String>();
        var server=HttpServer.create(new InetSocketAddress("127.0.0.1",0),0);
        server.createContext("/simulations/start-simulation",exchange->{
            body.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            byte[] response="{\"simulation_id\":\"fixed-window-test\"}".getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type","application/json");
            exchange.sendResponseHeaders(201,response.length);
            try(var output=exchange.getResponseBody()){output.write(response);}
        });
        server.start();
        try {
            var client=new CosimulatorSimulationClient("http://127.0.0.1:"+server.getAddress().getPort(),mock(DefaultPlantLibrary.class));
            var request=new StartSimulationRequest("Fixed",ScenarioType.REFERENCE,"andravida","Set",null,
                new OpenWindowsRequest(WindowOpeningStrategy.FIXED_PERCENTAGE,2,800,percentage),null,null,Map.of());
            assertEquals("fixed-window-test",client.start("test@example.com","Set",request,new ConstructionSetSnapshot(
                new ComponentSnapshot("set-id","Set","construction_set",Map.of("Name","Set")),java.util.List.of(),java.util.List.of())));
            assertTrue(body.get().contains("\"opening_strategy\":\"fixed_percentage\""));
            assertTrue(body.get().contains("\"opening_percentage\":"+percentage));
        } finally {server.stop(0);}
    }

    @Test
    void restoresFixedPercentageFromSavedSimulationParameters() {
        var mongo=mock(org.springframework.data.mongodb.core.MongoTemplate.class);
        var service=new com.cozybench.simulation.service.SimulationService(mongo,
            mock(com.cozybench.simulation.service.ConstructionSetSnapshotService.class),
            mock(CosimulatorSimulationClient.class), mock(com.cozybench.building.model.type.ComponentTypeRegistry.class));
        var window=new org.bson.Document("opening_strategy","fixed_percentage")
            .append("opening_percentage",0.1).append("temperature_margin_c",2).append("co2_threshold_ppm",800);
        var document=new org.bson.Document("_id",new org.bson.types.ObjectId("507f1f77bcf86cd799439011"))
            .append("status","RUNNING").append("parameters",new org.bson.Document("open_windows",window));
        org.mockito.Mockito.when(mongo.findOne(org.mockito.ArgumentMatchers.any(org.springframework.data.mongodb.core.query.Query.class),
            org.mockito.ArgumentMatchers.eq(org.bson.Document.class),org.mockito.ArgumentMatchers.eq("simulations"))).thenReturn(document);
        var settings=service.current("owner","test@example.com").orElseThrow().simulation().openWindows();
        assertEquals(WindowOpeningStrategy.FIXED_PERCENTAGE,settings.openingStrategy());
        assertEquals(0.1,settings.openingPercentage());
    }

    @Test
    void validatesBoundsAndKeepsLegacyStrategiesWithoutPercentageValid() {
        try(var factory=Validation.buildDefaultValidatorFactory()) {
            var validator=factory.getValidator();
            for(Double invalid:new Double[]{null,-1.0,100.1,Double.NaN,Double.POSITIVE_INFINITY}) {
                assertFalse(validator.validate(new OpenWindowsRequest(WindowOpeningStrategy.FIXED_PERCENTAGE,2,800,invalid)).isEmpty());
            }
            for(var strategy:new WindowOpeningStrategy[]{WindowOpeningStrategy.LINEAR,WindowOpeningStrategy.ON_OFF}) {
                assertTrue(validator.validate(new OpenWindowsRequest(strategy,2,800,null)).isEmpty());
            }
            assertTrue(validator.validate(new OpenWindowsRequest(WindowOpeningStrategy.FIXED_PERCENTAGE,2,800,0.1)).isEmpty());
        }
    }
}
