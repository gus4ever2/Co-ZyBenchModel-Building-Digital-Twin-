package com.cozybench.simulation;

import com.cozybench.building.model.type.ComponentTypeRegistry;
import com.cozybench.simulation.service.*;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.stream.Stream;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SimulationExportTests {
    private final MongoTemplate mongo = mock(MongoTemplate.class);
    private final SimulationService service = new SimulationService(mongo,
            mock(ConstructionSetSnapshotService.class), mock(CosimulatorSimulationClient.class),
            mock(ComponentTypeRegistry.class));
    private final String id = "507f1f77bcf86cd799439011";

    @Test
    void exportsMetadataThenAllTimestepsAndNormalizesIdsAndDates() throws Exception {
        when(mongo.findOne(any(Query.class), eq(Document.class), eq("simulations")))
                .thenReturn(new Document("_id", new ObjectId(id))
                        .append("status", "COMPLETED").append("display_name", "Office")
                        .append("end_time", new Date(0)));
        when(mongo.stream(any(Query.class), eq(Document.class), eq("simulation_timesteps")))
                .thenReturn(Stream.of(new Document("timestep_number", 1),
                        new Document("timestep_number", 2), new Document("timestep_number", 3)));
        var output = new ByteArrayOutputStream();
        service.exportJson("owner", "user@example.com", id).writeTo(output);
        String json = output.toString(StandardCharsets.UTF_8);
        Document parsed = Document.parse(json);
        assertTrue(json.indexOf("\"simulation\"") < json.indexOf("\"timesteps\""));
        assertEquals(id, parsed.get("simulation", Document.class).getString("_id"));
        assertEquals("1970-01-01T00:00:00Z", parsed.get("simulation", Document.class).getString("end_time"));
        assertEquals(3, parsed.getList("timesteps", Document.class).size());
        var query = org.mockito.ArgumentCaptor.forClass(Query.class);
        verify(mongo).stream(query.capture(), eq(Document.class), eq("simulation_timesteps"));
        assertEquals(0, query.getValue().getLimit());
        assertEquals("user@example.com", query.getValue().getQueryObject().getString("user_email"));
        assertEquals(id, query.getValue().getQueryObject().getString("simulation_id"));
        assertEquals(1, query.getValue().getSortObject().getInteger("timestep_number"));
    }

    @Test
    void rejectsUnknownOrActiveSimulationBeforeStartingDownload() {
        when(mongo.findOne(any(Query.class), eq(Document.class), eq("simulations")))
                .thenReturn(null);
        assertThrows(IllegalArgumentException.class, () -> service.exportJson("owner", "email", id));
        when(mongo.findOne(any(Query.class), eq(Document.class), eq("simulations")))
                .thenReturn(new Document("status", "RUNNING"));
        assertThrows(IllegalArgumentException.class, () -> service.exportJson("owner", "email", id));
        verify(mongo, never()).stream(any(Query.class), eq(Document.class), anyString());
    }
}
