package com.cozybench.simulation;

import com.cozybench.building.model.document.BuildingLibraryObjectDocument;
import com.cozybench.building.model.document.WorkspaceComponentDocument;
import com.cozybench.building.model.type.ComponentTypeRegistry;
import com.cozybench.simulation.service.LibrarySnapshotBuilder;
import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class LibrarySnapshotBuilderTests {
    private final LibrarySnapshotBuilder builder = new LibrarySnapshotBuilder();

    @Test
    void resolvesIdsToNamesAndIncludesSharedObjectsOnce() {
        var material = object("m1", "Brick", "MATERIAL", "MATERIAL", Map.of("Name", "Brick"));
        var wall = object("c1", "Wall", "CONSTRUCTION", "CONSTRUCTION",
                Map.of("Name", "Wall", "Outside_Layer", "m1", "Layer_2", ""));
        var set = object("s1", "technical-name", "CONSTRUCTION_SET", "construction_set",
                Map.of("exteriorWall", "c1", "interiorWall", "c1"));

        var snapshot = builder.build("s1", "Readable name", List.of(material, wall, set));
        assertEquals("Readable name", snapshot.constructionSet().name());
        assertEquals("Readable name", snapshot.constructionSet().properties().get("Name"));
        assertEquals("Wall", snapshot.constructionSet().properties().get("exteriorWall"));
        assertEquals(1, snapshot.constructions().size());
        assertEquals("Brick", snapshot.constructions().getFirst().properties().get("Outside_Layer"));
        assertFalse(snapshot.constructions().getFirst().properties().containsKey("Layer_2"));
        assertEquals(1, snapshot.materials().size());
        assertEquals("m1", wall.getProperties().get("Outside_Layer"));
    }

    @Test
    void rejectsReferencesToMissingOrWrongCategoryObjects() {
        var set = object("s1", "Set", "CONSTRUCTION_SET", "construction_set", Map.of("exteriorWall", "m1"));
        var material = object("m1", "Brick", "MATERIAL", "MATERIAL", Map.of());
        assertThrows(IllegalArgumentException.class, () -> builder.build("s1", null, List.of(set, material)));
    }

    @Test
    void workspaceSnapshotResolvesIdsAndDoesNotReadAnotherOwnersObjects() {
        var material = workspace("m1", "alice", "Brick", "MATERIAL", Map.of("Name", "Brick"));
        var wall = workspace("c1", "alice", "Wall", "CONSTRUCTION", Map.of("Name", "Wall", "Outside_Layer", "m1"));
        var set = workspace("s1", "alice", "Set", "construction_set", Map.of("Name", "Set", "Exterior_Wall", "c1"));
        var other = workspace("m2", "bob", "Other", "MATERIAL", Map.of("Name", "Other"));

        var snapshot = builder.buildWorkspace("alice", "s1", List.of(material, wall, set, other), new ComponentTypeRegistry());
        assertEquals("Wall", snapshot.constructionSet().properties().get("Exterior_Wall"));
        assertEquals("Brick", snapshot.constructions().getFirst().properties().get("Outside_Layer"));
        assertEquals(1, snapshot.materials().size());
        assertThrows(IllegalArgumentException.class,
                () -> builder.buildWorkspace("bob", "s1", List.of(material, wall, set, other), new ComponentTypeRegistry()));
    }

    @Test
    void heatSourceAddsBothObjectsButSurfaceReferencesTheConstruction() {
        var material = object("m", "Brick", "MATERIAL", "MATERIAL", Map.of("Name", "Brick"));
        var wall = object("c", "Wall", "CONSTRUCTION", "CONSTRUCTION",
                Map.of("Name", "Wall", "Outside_Layer", "m"));
        var source = object("h", "Wall source", "CONSTRUCTION", "CONSTRUCTIONPROPERTY:INTERNALHEATSOURCE",
                Map.of("Name", "Wall source", "Construction_Name", "c"));
        var set = object("s", "Set", "CONSTRUCTION_SET", "construction_set", Map.of("Exterior_Wall", "h"));

        var snapshot = builder.build("s", null, List.of(material, wall, source, set));
        assertEquals("Wall", snapshot.constructionSet().properties().get("Exterior_Wall"));
        assertEquals(2, snapshot.constructions().size());
        assertEquals("Wall", snapshot.constructions().stream()
                .filter(item -> item.id().equals("h")).findFirst().orElseThrow()
                .properties().get("Construction_Name"));
        assertEquals("Wall Internal Heat Source", snapshot.constructions().stream()
                .filter(item -> item.id().equals("h")).findFirst().orElseThrow().name());
    }

    private WorkspaceComponentDocument workspace(
            String id, String owner, String name, String type, Map<String, String> properties
    ) {
        return WorkspaceComponentDocument.builder().id(id).ownerId(owner).name(name).nameKey(name.toLowerCase())
                .type(type).properties(new LinkedHashMap<>(properties)).build();
    }

    private BuildingLibraryObjectDocument object(
            String id, String name, String category, String type, Map<String, String> properties
    ) {
        return BuildingLibraryObjectDocument.builder()
                .id(id).name(name).nameKey(name.toLowerCase()).category(category).type(type)
                .properties(new LinkedHashMap<>(properties)).build();
    }
}
