package com.cozybench.building.service.library.importer;

import com.cozybench.building.model.document.BuildingLibraryObjectDocument;
import com.cozybench.building.model.document.WorkspaceComponentDocument;
import com.cozybench.building.factory.ComponentFactoryResolver;
import com.cozybench.building.model.type.ComponentCategory;
import com.cozybench.building.model.type.ComponentTypeRegistry;
import com.cozybench.building.model.type.ConstructionType;
import com.cozybench.building.idfobject.construction.ConstructionLayerProperty;
import com.cozybench.building.idfobject.construction.InternalHeatSourceProperty;
import com.cozybench.building.repository.BuildingLibraryObjectRepository;
import com.cozybench.building.repository.WorkspaceComponentRepository;
import com.cozybench.building.service.workspace.DeleteDocumentInWorkspaceService;
import com.cozybench.building.service.workspace.ImportToWorkspaceService;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;

/** Imports a layered construction after importing each material it uses. */
@Component
public final class ConstructionImporter extends AbstractLibraryObjectImporter {
    private final MaterialImporter materials;

    public ConstructionImporter(
            BuildingLibraryObjectRepository libraryRepository,
            WorkspaceComponentRepository workspaceRepository,
            ImportToWorkspaceService importToWorkspace,
            ComponentFactoryResolver factoryResolver,
            ComponentTypeRegistry typeRegistry,
            DeleteDocumentInWorkspaceService workspaceDeletes,
            MaterialImporter materials
    ) {
        super(
                libraryRepository,
                workspaceRepository,
                importToWorkspace,
                factoryResolver,
                typeRegistry,
                workspaceDeletes
        );
        this.materials = materials;
    }

    @Override
    protected ImportedObjectDefinition createDefinition(
            BuildingLibraryObjectDocument source,
            LibraryImportContext context
    ) {
        LinkedHashMap<String, String> properties = new LinkedHashMap<>(source.getProperties());
        if (typeOf(source) == ConstructionType.CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE) {
            WorkspaceComponentDocument parent = importDependency(
                    properties.get(InternalHeatSourceProperty.CONSTRUCTION_NAME.fieldName()),
                    ComponentCategory.CONSTRUCTION,
                    this,
                    context
            );
            if (typeOf(parent) != ConstructionType.CONSTRUCTION) {
                throw new IllegalArgumentException("Internal heat source requires a layered construction");
            }
            properties.put(InternalHeatSourceProperty.CONSTRUCTION_NAME.fieldName(), parent.getId());
            return new ImportedObjectDefinition(parent.getName() + " Internal Heat Source", properties);
        }
        for (ConstructionLayerProperty layer : ConstructionLayerProperty.values()) {
            String materialLibraryId = properties.get(layer.fieldName());
            if (materialLibraryId == null || materialLibraryId.isBlank()) continue;
            properties.put(layer.fieldName(), importDependency(
                    materialLibraryId, ComponentCategory.MATERIAL, materials, context).getId());
        }
        return new ImportedObjectDefinition(source.getName(), properties);
    }
}
