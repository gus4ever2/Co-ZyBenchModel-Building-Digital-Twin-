package com.cozybench.building.service.library;

import com.cozybench.building.model.document.BuildingLibraryObjectDocument;
import com.cozybench.building.model.type.ComponentType;
import com.cozybench.building.model.type.ComponentTypeRegistry;
import com.cozybench.building.repository.BuildingLibraryObjectRepository;
import com.cozybench.building.service.library.importer.ConstructionImporter;
import com.cozybench.building.service.library.importer.ConstructionSetImporter;
import com.cozybench.building.service.library.importer.LibraryImportResult;
import com.cozybench.building.service.library.importer.MaterialImporter;
import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class LibraryImportServiceTests {
    @Test
    void importsOnlyTheRequestedLibraryGraph() {
        var library = mock(BuildingLibraryObjectRepository.class);
        var material = BuildingLibraryObjectDocument.builder().id("m").name("Brick").nameKey("brick")
                .category("MATERIAL").type("MATERIAL").properties(new LinkedHashMap<>(Map.of("Name", "Brick"))).build();
        when(library.findById("m")).thenReturn(Optional.of(material));
        var materialImporter = mock(MaterialImporter.class);
        var imported = com.cozybench.building.model.document.WorkspaceComponentDocument.builder()
                .id("workspace-material").ownerId("alice").name("Brick").nameKey("brick")
                .type("MATERIAL").sourceLibraryId("m").modified(false)
                .properties(new LinkedHashMap<>(Map.of("Name", "Brick"))).build();
        when(materialImporter.importSelectedObject("alice", material))
                .thenReturn(new LibraryImportResult(imported, java.util.List.of("workspace-material")));
        var service = new LibraryImportService(library, new ComponentTypeRegistry(), materialImporter,
                mock(ConstructionImporter.class), mock(ConstructionSetImporter.class));

        ComponentType requestedType = new ComponentTypeRegistry().resolve("MATERIAL");
        var result = service.importFromLibrary("m", requestedType, "alice");
        assertEquals("m", result.selected().getSourceLibraryId());
        assertFalse(result.selected().getModified());
        assertEquals(java.util.List.of("workspace-material"), result.createdIds());
        verify(library, never()).findAll();
    }

    @Test
    void displayNamePreservesCombinedClimateZones() {
        assertEquals("ASHRAE 189.1 (2009) · Office · Climate zone 7-8",
                com.cozybench.building.model.type.PredefinedConstructionSetName.displayNameFor("189_1_2009_CZ7_8_Office"));
    }
}
