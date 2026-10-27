package com.cozybench.plant.service;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DefaultPlantLibraryTests {
    private final MongoTemplate mongo = mock(MongoTemplate.class);
    private final GridFsTemplate files = mock(GridFsTemplate.class);
    private final DefaultPlantLibrary library = new DefaultPlantLibrary(mongo, files);

    @Test
    void choicesComeOnlyFromTheDefaultCollection() {
        when(mongo.findAll(Document.class, "plantLibrary")).thenReturn(List.of(
                new Document("_id", new ObjectId()).append("name", "Spathiphyllum")));
        var choices = (List<?>) library.choices().get("plants");
        assertEquals(1, choices.size());
        assertTrue(choices.getFirst().toString().contains("Spathiphyllum"));
        verify(mongo, never()).findAll(Document.class, "plants");
    }

    @Test
    void preparesSeparateUserPlantAndGridWithoutCopyingOrDeletingSharedFiles() {
        String id = new ObjectId().toHexString();
        var profile = new Document("schema_version", 2).append("grid_point_count", 16200)
                .append("total_leaf_area_m2", 1.5).append("parameters", new Document("vcmax", 30.0));
        var obj = new ObjectId();
        when(mongo.findOne(any(Query.class), eq(Document.class), eq("plantLibrary")))
                .thenReturn(new Document("name", "Spathiphyllum").append("profile", profile)
                        .append("obj_file_id", obj).append("mtl_file_id", new ObjectId()));
        String prepared = library.prepare("user@example.com", id);
        assertNotEquals(id, prepared);
        var capture = org.mockito.ArgumentCaptor.forClass(Document.class);
        verify(mongo).insert(capture.capture(), eq("plants"));
        assertEquals("user@example.com", capture.getValue().getString("user_email"));
        assertEquals(id, capture.getValue().getString("defaultLibraryId"));
        assertEquals(obj, capture.getValue().get("obj_file_id"));
        verify(mongo).insert(any(Document.class), eq("plant_profile_grids"));
        when(mongo.exists(any(Query.class), eq("plants"))).thenReturn(true);
        library.release("user@example.com", prepared);
        verify(mongo).remove(any(Query.class), eq("plants"));
        verify(mongo).remove(any(Query.class), eq("plant_profile_grids"));
        verifyNoInteractions(files);
    }
}
