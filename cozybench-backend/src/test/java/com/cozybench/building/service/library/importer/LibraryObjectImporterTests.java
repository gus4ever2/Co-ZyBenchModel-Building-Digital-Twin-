package com.cozybench.building.service.library.importer;

import com.cozybench.building.model.document.BuildingLibraryObjectDocument;
import com.cozybench.building.model.document.WorkspaceComponentDocument;
import com.cozybench.building.factory.ComponentFactory;
import com.cozybench.building.factory.ComponentFactoryResolver;
import com.cozybench.building.model.type.ComponentType;
import com.cozybench.building.model.type.ComponentTypeRegistry;
import com.cozybench.building.repository.BuildingLibraryObjectRepository;
import com.cozybench.building.repository.WorkspaceComponentRepository;
import com.cozybench.building.service.workspace.ImportToWorkspaceService;
import com.cozybench.building.service.workspace.DeleteDocumentInWorkspaceService;
import com.cozybench.building.service.workspace.WorkspaceImportRequest;
import com.cozybench.building.model.validation.IddPropertiesRecord;
import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class LibraryObjectImporterTests {

    @Test
    void importsOnlyTheSelectedGraphAndRemapsSharedReferences() {
        var material = library("m", "Brick", "MATERIAL", "MATERIAL", Map.of("Name", "Brick"));
        var wall = library("c", "Wall", "CONSTRUCTION", "CONSTRUCTION", Map.of("Name", "Wall", "Outside_Layer", "m"));
        var set = library("s", "Set", "CONSTRUCTION_SET", "construction_set",
                Map.of("Name", "Set", "exteriorWall", "c", "interiorWall", "c"));
        var existingMaterial = workspace("old-m", "alice", "Brick", "m", false);

        var fixture = fixture(Map.of("m", material, "c", wall, "s", set), Map.of("m", existingMaterial));
        var result = fixture.constructionSets.importSelectedObject("alice", fixture.sources.get("s"));

        assertEquals(List.of("copy-Wall", "copy-Set"), result.createdIds());
        var copiedWallId = result.createdIds().getFirst();
        assertEquals(copiedWallId, result.selected().getProperties().get("exteriorWall"));
        assertEquals(copiedWallId, result.selected().getProperties().get("interiorWall"));
        assertFalse(result.selected().getModified());
        var importedRequests = org.mockito.ArgumentCaptor.forClass(WorkspaceImportRequest.class);
        verify(fixture.importService, times(2)).importRecord(importedRequests.capture());
        assertEquals("old-m", importedRequests.getAllValues().getFirst()
                .component().toProperties().get("Outside_Layer"));
        verify(fixture.library, never()).findAll();
        verify(fixture.workspace, never()).findAllByOwnerIdOrderByNameAsc(anyString());
    }

    @Test
    void rejectsMissingReferencesBeforeReturningCopies() {
        var wall = library("c", "Wall", "CONSTRUCTION", "CONSTRUCTION", Map.of("Outside_Layer", "missing"));
        var fixture = fixture(Map.of("c", wall), Map.of());
        assertThrows(IllegalArgumentException.class,
                () -> fixture.constructions.importSelectedObject("alice", fixture.sources.get("c")));
    }

    @Test
    void derivesInternalHeatSourceNameFromImportedConstruction() {
        var wall = library("c", "Wall", "CONSTRUCTION", "CONSTRUCTION", Map.of("Name", "Wall"));
        var source = library("h", "Old name", "CONSTRUCTION", "CONSTRUCTIONPROPERTY:INTERNALHEATSOURCE",
                Map.of("Construction_Name", "c"));
        var fixture = fixture(Map.of("c", wall, "h", source), Map.of());

        var result = fixture.constructions.importSelectedObject("alice", fixture.sources.get("h"));
        assertEquals(List.of("copy-Wall", "copy-Wall Internal Heat Source"), result.createdIds());
        assertEquals("Wall Internal Heat Source", result.selected().getName());
        assertEquals(result.createdIds().getFirst(), result.selected().getProperties().get("Construction_Name"));
    }

    private Fixture fixture(
            Map<String, BuildingLibraryObjectDocument> sources,
            Map<String, WorkspaceComponentDocument> existingCopies
    ) {
        var library = mock(BuildingLibraryObjectRepository.class);
        var workspace = mock(WorkspaceComponentRepository.class);
        when(library.findById(anyString())).thenAnswer(invocation ->
                Optional.ofNullable(sources.get(invocation.getArgument(0)))
        );
        when(workspace.findByOwnerIdAndSourceLibraryIdAndModifiedFalse(anyString(), anyString()))
                .thenAnswer(invocation -> Optional.ofNullable(existingCopies.get(invocation.getArgument(1))));
        when(workspace.findByOwnerIdAndNameKey(anyString(), anyString())).thenReturn(Optional.empty());
        var factoryResolver = mock(ComponentFactoryResolver.class);
        var factory = mock(ComponentFactory.class);
        when(factoryResolver.resolve(any(ComponentType.class))).thenReturn(factory);
        when(factory.createFromValues(any())).thenAnswer(invocation -> {
            var values = (Map<String, String>) invocation.getArgument(0);
            return new TestProperties(values.get("Name"), values.get("Outside_Layer"),
                    values.get("Construction_Name"), values.get("exteriorWall"), values.get("interiorWall"));
        });
        var importService = mock(ImportToWorkspaceService.class);
        when(importService.importRecord(any(WorkspaceImportRequest.class))).thenAnswer(invocation -> {
            var request = (WorkspaceImportRequest) invocation.getArgument(0);
            var record = request.component();
            var type = new ComponentTypeRegistry().resolve(request.typePath().type());
            return WorkspaceComponentDocument.builder().id("copy-" + record.Name()).ownerId(request.ownerId())
                    .name(record.Name()).nameKey(record.Name().toLowerCase())
                    .domain(request.typePath().domain().name()).category(request.typePath().category().name())
                    .type(type.apiName()).epiName(type.eppyName()).sourceLibraryId(request.origin().sourceLibraryId())
                    .modified(request.origin().modified()).properties(record.toProperties()).build();
        });

        var typeRegistry = new ComponentTypeRegistry();
        var workspaceDeletes = new DeleteDocumentInWorkspaceService(workspace, typeRegistry);
        var materials = new MaterialImporter(
                library, workspace, importService, factoryResolver, typeRegistry, workspaceDeletes);
        var constructions = new ConstructionImporter(
                library, workspace, importService, factoryResolver, typeRegistry, workspaceDeletes, materials);
        var constructionSets = new ConstructionSetImporter(
                library, workspace, importService, factoryResolver, typeRegistry, workspaceDeletes, constructions);
        return new Fixture(library, workspace, importService, materials, constructions, constructionSets, sources);
    }

    private BuildingLibraryObjectDocument library(String id, String name, String category,
                                                   String type, Map<String, String> properties) {
        return BuildingLibraryObjectDocument.builder().id(id).name(name).nameKey(name.toLowerCase())
                .category(category).type(type).properties(new LinkedHashMap<>(properties)).build();
    }

    private WorkspaceComponentDocument workspace(String id, String owner, String name, String source, boolean modified) {
        return WorkspaceComponentDocument.builder().id(id).ownerId(owner).name(name).nameKey(name.toLowerCase())
                .domain("CONSTRUCTIONS").category("MATERIAL").type("MATERIAL").epiName("Material")
                .sourceLibraryId(source).modified(modified).properties(new LinkedHashMap<>()).build();
    }

    private record TestProperties(String Name, String Outside_Layer, String Construction_Name,
                                  String exteriorWall, String interiorWall) implements IddPropertiesRecord { }

    private record Fixture(
            BuildingLibraryObjectRepository library,
            WorkspaceComponentRepository workspace,
            ImportToWorkspaceService importService,
            MaterialImporter materials,
            ConstructionImporter constructions,
            ConstructionSetImporter constructionSets,
            Map<String, BuildingLibraryObjectDocument> sources
    ) { }
}
