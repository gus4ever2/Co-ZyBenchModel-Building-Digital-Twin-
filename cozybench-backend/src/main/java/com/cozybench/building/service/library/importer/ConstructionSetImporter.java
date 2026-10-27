package com.cozybench.building.service.library.importer;

import com.cozybench.building.model.document.BuildingLibraryObjectDocument;
import com.cozybench.building.factory.ComponentFactoryResolver;
import com.cozybench.building.model.type.ComponentCategory;
import com.cozybench.building.model.type.ComponentTypeRegistry;
import com.cozybench.building.idfobject.constructionset.ConstructionSetProperty;
import com.cozybench.building.repository.BuildingLibraryObjectRepository;
import com.cozybench.building.repository.WorkspaceComponentRepository;
import com.cozybench.building.service.workspace.DeleteDocumentInWorkspaceService;
import com.cozybench.building.service.workspace.ImportToWorkspaceService;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;

/** Imports a construction set after converting all construction references. */
@Component
public final class ConstructionSetImporter extends AbstractLibraryObjectImporter {
    private final ConstructionImporter constructions;

    public ConstructionSetImporter(
            BuildingLibraryObjectRepository libraryRepository,
            WorkspaceComponentRepository workspaceRepository,
            ImportToWorkspaceService importToWorkspace,
            ComponentFactoryResolver factoryResolver,
            ComponentTypeRegistry typeRegistry,
            DeleteDocumentInWorkspaceService workspaceDeletes,
            ConstructionImporter constructions
    ) {
        super(
                libraryRepository,
                workspaceRepository,
                importToWorkspace,
                factoryResolver,
                typeRegistry,
                workspaceDeletes
        );
        this.constructions = constructions;
    }

    @Override
    protected ImportedObjectDefinition createDefinition(
            BuildingLibraryObjectDocument source,
            LibraryImportContext context
    ) {
        LinkedHashMap<String, String> properties = new LinkedHashMap<>(source.getProperties());
        for (ConstructionSetProperty slot : ConstructionSetProperty.values()) {
            String libraryConstructionId = properties.get(slot.fieldName());
            if (libraryConstructionId == null || libraryConstructionId.isBlank()) {
                continue;
            }
            String constructionWorkspaceId = importDependency(
                    libraryConstructionId, ComponentCategory.CONSTRUCTION, constructions, context).getId();
            properties.put(slot.fieldName(), constructionWorkspaceId);
        }
        return new ImportedObjectDefinition(source.getName(), properties);
    }
}
