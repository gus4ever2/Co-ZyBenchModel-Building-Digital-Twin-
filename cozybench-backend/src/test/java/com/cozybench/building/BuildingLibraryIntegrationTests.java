package com.cozybench.building;

import com.cozybench.building.repository.BuildingLibraryObjectRepository;
import com.cozybench.building.repository.WorkspaceComponentRepository;
import com.cozybench.building.service.library.LibraryImportService;
import com.cozybench.building.service.workspace.WorkspaceComponentCoordinator;
import com.cozybench.building.dto.ComponentUpdateRequest;
import com.cozybench.building.model.document.WorkspaceComponentDocument;
import com.cozybench.building.model.type.ComponentDomain;
import com.cozybench.building.model.type.ComponentType;
import com.cozybench.building.model.type.ComponentTypePath;
import com.cozybench.building.model.type.ComponentTypeRegistry;
import com.cozybench.building.service.query.BuildingComponentQueryService;
import com.cozybench.simulation.service.ConstructionSetSnapshotService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import java.util.UUID;
import java.util.LinkedHashMap;

import static org.junit.jupiter.api.Assertions.*;

/** Explicitly opt in; this test never connects to the application's database. */
@EnabledIfSystemProperty(named = "cozybench.integration.test", matches = "true")
@SpringBootTest(properties = "spring.mongodb.uri=mongodb://localhost:27017/cozybench_codex_integration_20261017_8821")
class BuildingLibraryIntegrationTests {
    @Autowired BuildingLibraryObjectRepository library;
    @Autowired WorkspaceComponentRepository workspace;
    @Autowired LibraryImportService importer;
    @Autowired ConstructionSetSnapshotService snapshots;
    @Autowired WorkspaceComponentCoordinator crud;
    @Autowired BuildingComponentQueryService queries;

    @Test
    void importsTheLinkedSetAndSnapshotsItWithoutTouchingAnotherUser() {
        String owner = "integration-test-" + UUID.randomUUID();
        var predefinedSets = library.findByCategoryOrderByNameAsc("CONSTRUCTION_SET");
        assertEquals(7, predefinedSets.size());
        var source = predefinedSets.getFirst();
        long before = workspace.count();

        for (var predefined : predefinedSets) {
            var snapshot = snapshots.snapshot(owner, predefined.getName());
            assertFalse(snapshot.constructions().isEmpty(), predefined.getName());
            assertFalse(snapshot.materials().isEmpty(), predefined.getName());
        }
        var directSnapshot = snapshots.snapshot(owner, source.getName());
        assertFalse(directSnapshot.constructions().isEmpty());
        assertFalse(directSnapshot.materials().isEmpty());
        assertEquals(before, workspace.count(), "predefined snapshot must not import objects");

        var imported = importer.importFromLibrary(source.getId(), typeFor(source.getType()), owner).selected();
        assertEquals(source.getId(), imported.getSourceLibraryId());
        assertEquals(Boolean.FALSE, imported.getModified());
        var importedSnapshot = snapshots.snapshot(owner, imported.getId());
        assertEquals(directSnapshot.constructions().size(), importedSnapshot.constructions().size());
        assertEquals(directSnapshot.materials().size(), importedSnapshot.materials().size());
        long importedCount = workspace.count();
        assertEquals(imported.getId(), importer.importFromLibrary(
                source.getId(), typeFor(source.getType()), owner).selected().getId());
        assertEquals(importedCount, workspace.count(), "unchanged objects should be reused");
        assertTrue(workspace.findAllByOwnerIdOrderByNameAsc("another-user").isEmpty());

        // The public editor lists must understand every object in the real seed data.
        assertNotNull(queries.materials(owner, null));
        assertNotNull(queries.constructions(owner, null));
        assertNotNull(queries.constructionSets(owner, null));

        var material = workspace.findByIdAndOwnerId(importedSnapshot.materials().getFirst().id(), owner).orElseThrow();
        var changedProperties = new LinkedHashMap<>(material.getProperties());
        changedProperties.put("Name", material.getName() + " edited");
        crud.update(owner, requestFor(material, changedProperties));
        assertEquals(Boolean.TRUE, workspace.findById(imported.getId()).orElseThrow().getModified());
        assertNotEquals(material.getName() + " edited", importedSnapshot.materials().getFirst().name(),
                "already created snapshots must not change");

        var secondImport = importer.importFromLibrary(source.getId(), typeFor(source.getType()), owner).selected();
        assertNotEquals(imported.getId(), secondImport.getId(), "modified set must not be reused");
        var dependent = workspace.findAllByOwnerIdOrderByNameAsc(owner).stream()
                .filter(item -> item.getProperties().containsValue(material.getId()))
                .findFirst().orElseThrow();
        crud.delete(owner, material.getId());
        assertFalse(workspace.findById(dependent.getId()).orElseThrow().getProperties().containsValue(material.getId()));
        assertTrue(workspace.findById(secondImport.getId()).isPresent());
    }

    @Test
    void internalHeatSourceFollowsConstructionAndAppearsInSnapshot() {
        String owner = "integration-test-" + UUID.randomUUID();
        var setSource = library.findByCategoryOrderByNameAsc("CONSTRUCTION_SET").getFirst();
        var set = importer.importFromLibrary(setSource.getId(), typeFor(setSource.getType()), owner).selected();
        var initial = snapshots.snapshot(owner, set.getId());
        var wall = initial.constructions().stream()
                .filter(item -> item.type().equals("CONSTRUCTION"))
                .filter(item -> item.properties().containsKey("Layer_2"))
                .findFirst().orElseThrow();

        String sourceType = "CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE";
        var source = crud.create(owner, pathFor(sourceType));
        var properties = new LinkedHashMap<>(source.getProperties());
        properties.put("Construction_Name", wall.id());
        source = crud.update(owner, requestFor(source, properties));
        assertEquals(wall.name() + " Internal Heat Source", source.getName());

        var setProperties = new LinkedHashMap<>(set.getProperties());
        setProperties.put("exteriorWall", source.getId());
        crud.update(owner, requestFor(set, setProperties));
        var result = snapshots.snapshot(owner, set.getId());
        assertEquals(wall.name(), result.constructionSet().properties().get("exteriorWall"));
        assertTrue(result.constructions().stream().anyMatch(item -> item.id().equals(wall.id())));
        String sourceId = source.getId();
        assertTrue(result.constructions().stream().anyMatch(item -> item.id().equals(sourceId)
                && item.properties().get("Construction_Name").equals(wall.name())));

        var wallDocument = workspace.findById(wall.id()).orElseThrow();
        var wallProperties = new LinkedHashMap<>(wallDocument.getProperties());
        wallProperties.put("Name", wall.name() + " renamed");
        crud.update(owner, requestFor(wallDocument, wallProperties));
        assertEquals(wall.name() + " renamed Internal Heat Source", workspace.findById(sourceId).orElseThrow().getName());
    }

    private static ComponentTypePath pathFor(String storedType) {
        ComponentType type = typeFor(storedType);
        return new ComponentTypePath(ComponentDomain.CONSTRUCTIONS, type.category(), type.apiName());
    }

    private static ComponentType typeFor(String storedType) {
        return new ComponentTypeRegistry().resolve(storedType);
    }

    private static ComponentUpdateRequest requestFor(
            WorkspaceComponentDocument component,
            LinkedHashMap<String, String> properties
    ) {
        ComponentTypePath path = pathFor(component.getType());
        return new ComponentUpdateRequest(
                component.getId(), path.domain(), path.category(), path.type(), properties);
    }
}
