package com.cozybench.config.library;

import org.bson.Document;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;

class LibrarySeedImportCoordinatorTests {

    private final LibrarySeedImportCoordinator coordinator = new LibrarySeedImportCoordinator(List.of(
            new MaterialLibrarySeedImporter(),
            new ConstructionLibrarySeedImporter(),
            new ConstructionSetLibrarySeedImporter()
    ));

    @Test
    void linksSharedMaterialAndConstructionByTheirNewIds() {
        Document material = object("Brick", "MATERIAL", new Document("Name", "Brick"));
        Document wall = object("Wall", "CONSTRUCTION",
                new Document("Name", "Wall").append("Outside_Layer", "Brick"));
        Document set = object("Office", "construction_set",
                new Document("exteriorWall", "Wall").append("interiorWall", "Wall"));

        List<Document> result = coordinator.prepare(Map.of(
                "material", List.of(material),
                "construction", List.of(wall),
                "constructionSet", List.of(set)
        ));

        String materialId = result.get(0).getObjectId("_id").toHexString();
        String wallId = result.get(1).getObjectId("_id").toHexString();
        assertEquals(materialId, result.get(1).get("properties", Document.class).get("Outside_Layer"));
        assertEquals(wallId, result.get(2).get("properties", Document.class).get("exteriorWall"));
        assertEquals(wallId, result.get(2).get("properties", Document.class).get("interiorWall"));
        assertEquals("Brick", wall.get("properties", Document.class).get("Outside_Layer"));
    }

    @Test
    void rejectsMissingReferencesAndDuplicateNamesAcrossFamilies() {
        Document material = object("Brick", "MATERIAL", new Document());
        Document wall = object("Wall", "CONSTRUCTION", new Document("Outside_Layer", "Missing"));
        assertThrows(IllegalArgumentException.class, () -> coordinator.prepare(Map.of(
                "material", List.of(material), "construction", List.of(wall), "constructionSet", List.of()
        )));

        Document duplicate = object(" brick ", "CONSTRUCTION", new Document());
        assertThrows(IllegalArgumentException.class, () -> coordinator.prepare(Map.of(
                "material", List.of(material), "construction", List.of(duplicate), "constructionSet", List.of()
        )));
    }

    @Test
    void preparesTheBundledLibraryWithoutMissingReferences() {
        List<Document> result = coordinator.prepareLibrary();
        assertFalse(result.isEmpty());
        assertEquals(result.size(), result.stream().map(document -> document.getString("nameKey")).distinct().count());
    }

    private Document object(String name, String type, Document properties) {
        return new Document("name", name).append("type", type).append("properties", properties);
    }
}
