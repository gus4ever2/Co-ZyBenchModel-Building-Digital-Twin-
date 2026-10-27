package com.cozybench.simulation;

import com.cozybench.building.model.type.ComponentTypeRegistry;
import com.cozybench.simulation.service.ConstructionSetSnapshotService;
import com.cozybench.simulation.service.CosimulatorSimulationClient;
import com.cozybench.simulation.service.SimulationService;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;

import java.util.Date;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class SimulationResultsTests {
    @Test
    void nameAvailabilityChecksOnlyOwnedSimulationsAndTreatsNamesAsLiteral() {
        var mongo = mock(MongoTemplate.class);
        var service = new SimulationService(mongo, mock(ConstructionSetSnapshotService.class),
                mock(CosimulatorSimulationClient.class), mock(ComponentTypeRegistry.class));
        when(mongo.exists(any(Query.class), eq("simulations"))).thenReturn(true, false);
        assertFalse(service.isNameAvailable("owner", "user@example.com", "  Test.*  "));
        assertTrue(service.isNameAvailable("owner", "user@example.com", "other"));
        var query = ArgumentCaptor.forClass(Query.class);
        verify(mongo, times(2)).exists(query.capture(), eq("simulations"));
        String criteria = query.getAllValues().getFirst().getQueryObject().toJson();
        assertTrue(criteria.contains("owner_id"));
        assertTrue(criteria.contains("user_email"));
        assertTrue(criteria.contains("\\\\QTest.*\\\\E"));
    }

    @Test
    void completedResultsReuseCountAcrossPagesButRunningResultsDoNot() {
        var mongo = mock(MongoTemplate.class);
        var service = new SimulationService(mongo, mock(ConstructionSetSnapshotService.class),
                mock(CosimulatorSimulationClient.class), mock(ComponentTypeRegistry.class));
        String id = "507f1f77bcf86cd799439011";
        when(mongo.findOne(any(Query.class), eq(Document.class), eq("simulations")))
                .thenReturn(new Document("status", "COMPLETED"))
                .thenReturn(new Document("status", "COMPLETED"))
                .thenReturn(new Document("status", "RUNNING"));
        when(mongo.count(any(Query.class), eq("simulation_timesteps"))).thenReturn(2500L, 2501L);

        assertEquals(2500, service.results("owner", "user@example.com", id, 0, 1000).total());
        assertEquals(2500, service.results("owner", "user@example.com", id, 1000, 1000).total());
        assertEquals(2501, service.results("owner", "user@example.com", id, 2000, 1000).total());
        verify(mongo, times(2)).count(any(Query.class), eq("simulation_timesteps"));
    }

    @Test
    void currentSimulationAlsoReadsLatestTimestepFromMongo() {
        var mongo = mock(MongoTemplate.class);
        var python = mock(CosimulatorSimulationClient.class);
        var service = new SimulationService(mongo, mock(ConstructionSetSnapshotService.class),
                python, mock(ComponentTypeRegistry.class));
        String id = "507f1f77bcf86cd799439011";
        when(mongo.findOne(any(Query.class), eq(Document.class), eq("simulations")))
                .thenReturn(new Document("_id", new ObjectId(id)).append("status", "RUNNING"));
        when(mongo.findOne(any(Query.class), eq(Document.class), eq("simulation_timesteps")))
                .thenReturn(new Document("timestep_number", 7));

        assertTrue(service.current("owner", "user@example.com").isPresent());
        var query = ArgumentCaptor.forClass(Query.class);
        verify(mongo).findOne(query.capture(), eq(Document.class), eq("simulation_timesteps"));
        assertEquals(-1, query.getValue().getSortObject().getInteger("timestep_number"));
        assertEquals(1, query.getValue().getLimit());
        verifyNoInteractions(python);
    }

    @Test
    void readsOwnedPageDirectlyFromMongoAndKeepsPresentationFields() {
        var mongo = mock(MongoTemplate.class);
        var python = mock(CosimulatorSimulationClient.class);
        var service = new SimulationService(mongo, mock(ConstructionSetSnapshotService.class),
                python, mock(ComponentTypeRegistry.class));
        String id = "507f1f77bcf86cd799439011";
        when(mongo.findOne(any(Query.class), eq(Document.class), eq("simulations")))
                .thenReturn(new Document("_id", new ObjectId(id)));
        when(mongo.count(any(Query.class), eq("simulation_timesteps"))).thenReturn(4L);
        Document timestep = new Document("_id", new ObjectId(id))
                .append("simulation_timestamp", new Date(0))
                .append("results", new Document("meter_results", new Document("hvac_electricity_j", 3_600_000))
                        .append("zone_results", new Document("Office", new Document("zone_air_temp_c", 20)
                                .append("mean_radiant_temperature_c", 24))));
        when(mongo.find(any(Query.class), eq(Document.class), eq("simulation_timesteps")))
                .thenReturn(List.of(timestep));

        var response = service.results("owner", "user@example.com", id, 2, 1);
        assertEquals(4, response.total());
        var result = response.timesteps().getFirst();
        assertEquals(id, result.get("_id"));
        assertEquals("1970-01-01T00:00:00Z", result.get("simulation_timestamp"));
        var results = (Map<?, ?>) result.get("results");
        var meters = (Map<?, ?>) results.get("meter_results");
        assertEquals(1.0, meters.get("hvac_electricity_kwh"));
        assertNull(meters.get("heating_electricity_kwh"));
        var zone = (Map<?, ?>) ((Map<?, ?>) results.get("zone_results")).get("Office");
        assertEquals(22.0, zone.get("operative_temperature_c"));
        var query = ArgumentCaptor.forClass(Query.class);
        verify(mongo).find(query.capture(), eq(Document.class), eq("simulation_timesteps"));
        assertEquals(2, query.getValue().getSkip());
        assertEquals(1, query.getValue().getLimit());
        assertEquals(1, query.getValue().getSortObject().getInteger("timestep_number"));
        assertEquals("user@example.com", query.getValue().getQueryObject().getString("user_email"));
        assertEquals(id, query.getValue().getQueryObject().getString("simulation_id"));
        verifyNoInteractions(python);
    }
}
