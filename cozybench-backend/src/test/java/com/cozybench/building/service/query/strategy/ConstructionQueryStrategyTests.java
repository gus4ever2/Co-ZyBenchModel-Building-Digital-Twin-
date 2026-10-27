package com.cozybench.building.service.query.strategy;

import com.cozybench.building.model.document.WorkspaceComponentDocument;
import com.cozybench.building.model.type.ComponentCategory;
import com.cozybench.building.model.type.ConstructionType;
import com.cozybench.building.model.type.MaterialType;
import com.cozybench.building.model.type.ComponentTypeRegistry;
import com.cozybench.building.repository.BuildingLibraryObjectRepository;
import com.cozybench.building.repository.WorkspaceComponentRepository;
import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ConstructionQueryStrategyTests {

    @Test
    void reusesLoadedEditorListsToFindSelectionAndResolveReferenceNames() {
        var repository = mock(WorkspaceComponentRepository.class);
        var library = mock(BuildingLibraryObjectRepository.class);
        var construction = workspaceObject("construction-id", "Wall", ConstructionType.CONSTRUCTION.apiName(),
                "material-id");
        var material = workspaceObject("material-id", "Brick", MaterialType.MATERIAL.apiName(), "");

        when(repository.findAllByOwnerIdAndTypeInOrderByNameAsc(eq("owner"), anyCollection()))
                .thenAnswer(invocation -> {
                    Set<String> requestedTypes = Set.copyOf((java.util.Collection<String>) invocation.getArgument(1));
                    return requestedTypes.contains(ConstructionType.CONSTRUCTION.apiName())
                            ? List.of(construction)
                            : List.of(material);
                });
        when(library.findByCategoryOrderByNameAsc(ComponentCategory.CONSTRUCTION.name()))
                .thenReturn(List.of());

        var strategy = new ConstructionQueryStrategy(repository, library, new ComponentTypeRegistry());
        var result = strategy.load("owner", "construction-id");

        assertEquals("Brick", result.component().properties().get("Outside_Layer"));
        assertEquals("Wall", result.componentDescriptions().componentParts().getFirst().name());
        assertEquals("Brick", result.selectableComponentDescriptions().componentParts().getFirst().name());
        verify(repository, never()).findByIdAndOwnerId("construction-id", "owner");
        verify(repository, never()).findAllByOwnerIdOrderByNameAsc("owner");
    }

    private WorkspaceComponentDocument workspaceObject(String id, String name, String type, String layer) {
        var componentType = new ComponentTypeRegistry().resolve(type);
        var properties = new LinkedHashMap<String, String>();
        properties.put("Name", name);
        properties.put("Outside_Layer", layer);
        return WorkspaceComponentDocument.builder()
                .id(id)
                .ownerId("owner")
                .name(name)
                .nameKey(name.toLowerCase())
                .domain("CONSTRUCTIONS")
                .category(componentType.category().name())
                .type(type)
                .epiName(componentType.eppyName())
                .properties(properties)
                .build();
    }
}
