package com.cozybench.building.service.workspace;

import com.cozybench.building.factory.ComponentFactory;
import com.cozybench.building.factory.ComponentFactoryResolver;
import com.cozybench.building.idfobject.material.Material;
import com.cozybench.building.model.type.ComponentCategory;
import com.cozybench.building.model.type.ComponentDomain;
import com.cozybench.building.model.type.ComponentTypePath;
import com.cozybench.building.model.type.ComponentTypeRegistry;
import com.cozybench.building.model.type.MaterialType;
import com.cozybench.building.repository.WorkspaceComponentRepository;
import com.cozybench.building.service.naming.ComponentNameService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ImportToWorkspaceServiceTests {

    @Test
    void createsAWorkspaceDraftWithDefaultsAndStructuredTypeMetadata() {
        var repository = mock(WorkspaceComponentRepository.class);
        var factories = mock(ComponentFactoryResolver.class);
        var factory = mock(ComponentFactory.class);
        var names = mock(ComponentNameService.class);
        var path = new ComponentTypePath(
                ComponentDomain.CONSTRUCTIONS, ComponentCategory.MATERIAL, MaterialType.MATERIAL.apiName());
        when(factories.resolve(path)).thenReturn(factory);
        when(factory.type()).thenReturn(MaterialType.MATERIAL);
        when(names.uniqueName("MATERIAL", "owner")).thenReturn("MATERIAL");
        when(names.nameKey("MATERIAL")).thenReturn("material");
        when(factory.createDefault("MATERIAL")).thenReturn(Material.builder().Name("MATERIAL").build());
        when(repository.save(any())).thenAnswer(call -> call.getArgument(0));

        var service = new ImportToWorkspaceService(repository, factories, names, new ComponentTypeRegistry());
        var result = service.importDefault("owner", path);

        assertEquals("CONSTRUCTIONS", result.getDomain());
        assertEquals("MATERIAL", result.getCategory());
        assertEquals(MaterialType.MATERIAL.apiName(), result.getType());
        assertEquals(MaterialType.MATERIAL.eppyName(), result.getEpiName());
        assertEquals(Boolean.TRUE, result.getModified());
        assertNull(result.getSourceLibraryId());
        assertEquals("MediumRough", result.getProperties().get("Roughness"));
    }
}
