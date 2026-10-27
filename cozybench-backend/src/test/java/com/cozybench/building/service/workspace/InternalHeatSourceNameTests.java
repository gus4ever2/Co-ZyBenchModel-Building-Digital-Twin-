package com.cozybench.building.service.workspace;

import com.cozybench.building.dto.ComponentUpdateRequest;
import com.cozybench.building.model.document.WorkspaceComponentDocument;
import com.cozybench.building.model.type.ComponentDomain;
import com.cozybench.building.model.type.ComponentTypePath;
import com.cozybench.building.model.type.ConstructionType;
import com.cozybench.building.model.type.ComponentTypeRegistry;
import com.cozybench.building.factory.ComponentFactoryResolver;
import com.cozybench.building.repository.WorkspaceComponentRepository;
import com.cozybench.building.service.naming.ComponentNameService;
import com.cozybench.building.model.validation.IddPropertiesRecord;
import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class InternalHeatSourceNameTests {
    @Test
    void ignoresUserSuppliedNameAndUsesSelectedConstruction() {
        var repository = mock(WorkspaceComponentRepository.class);
        var nameService = new ComponentNameService(repository);
        var importService = new ImportToWorkspaceService(repository, mock(ComponentFactoryResolver.class),
                nameService, new ComponentTypeRegistry());
        var service = new UpdateDocumentInWorkspaceService(repository,
                nameService, new ComponentTypeRegistry(), importService);
        var source = WorkspaceComponentDocument.builder().id("h").ownerId("owner")
                .name("Previous").nameKey("previous")
                .domain("CONSTRUCTIONS").category("CONSTRUCTION")
                .type(ConstructionType.CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE.apiName())
                .epiName(ConstructionType.CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE.eppyName())
                .properties(new LinkedHashMap<>()).build();
        var wall = WorkspaceComponentDocument.builder().id("c").ownerId("owner")
                .name("Wall").nameKey("wall").domain("CONSTRUCTIONS").category("CONSTRUCTION")
                .type(ConstructionType.CONSTRUCTION.apiName()).epiName("Construction")
                .properties(new LinkedHashMap<>(java.util.Map.of("Outside_Layer", "m", "Layer_2", "m2"))).build();
        when(repository.findByIdAndOwnerId("h", "owner")).thenReturn(Optional.of(source));
        when(repository.findByOwnerIdAndNameKey("owner", "wall")).thenReturn(Optional.of(wall));
        when(repository.findByIdAndOwnerId("Wall", "owner")).thenReturn(Optional.empty());
        when(repository.findByIdAndOwnerId("c", "owner")).thenReturn(Optional.of(wall));
        when(repository.findByOwnerIdAndNameKey("owner", "m")).thenReturn(Optional.of(
                WorkspaceComponentDocument.builder().id("m").ownerId("owner").name("Brick").nameKey("brick")
                        .type("MATERIAL").category("MATERIAL").properties(new LinkedHashMap<>()).build()));
        when(repository.findByOwnerIdAndNameKey("owner", "m2")).thenReturn(Optional.of(
                WorkspaceComponentDocument.builder().id("m2").ownerId("owner").name("Insulation").nameKey("insulation")
                        .type("MATERIAL").category("MATERIAL").properties(new LinkedHashMap<>()).build()));
        when(repository.findByIdAndOwnerId("h", "owner")).thenReturn(Optional.of(source));
        when(repository.save(any())).thenAnswer(call -> call.getArgument(0));

        var fields = new LinkedHashMap<String, String>();
        fields.put("Name", "Unexpected user input");
        fields.put("Construction_Name", "Wall");
        var request = new ComponentUpdateRequest(
                "h",
                ComponentDomain.CONSTRUCTIONS,
                ConstructionType.CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE.category(),
                ConstructionType.CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE.apiName(),
                fields
        );
        var result = service.update("owner", source,
                new ComponentTypePath(request.domain(), request.category(), request.type()),
                ConstructionType.CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE,
                new TestProperties("Unexpected user input", "Wall", 1, 1));
        assertEquals("Wall Internal Heat Source", result.getName());
        assertEquals(result.getName(), result.getProperties().get("Name"));
    }

    private record TestProperties(String Name, String Construction_Name,
                                  Integer Thermal_Source_Present_After_Layer_Number,
                                  Integer Temperature_Calculation_Requested_After_Layer_Number)
            implements IddPropertiesRecord { }
}
