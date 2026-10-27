package com.cozybench.building.service.library.importer;

import com.cozybench.building.model.document.BuildingLibraryObjectDocument;
import com.cozybench.building.factory.ComponentFactoryResolver;
import com.cozybench.building.model.type.ComponentTypeRegistry;
import com.cozybench.building.repository.BuildingLibraryObjectRepository;
import com.cozybench.building.repository.WorkspaceComponentRepository;
import com.cozybench.building.service.workspace.DeleteDocumentInWorkspaceService;
import com.cozybench.building.service.workspace.ImportToWorkspaceService;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;

/** Imports terminal material objects. Materials do not reference other objects. */
@Component
public final class MaterialImporter extends AbstractLibraryObjectImporter {

    public MaterialImporter(
            BuildingLibraryObjectRepository libraryRepository,
            WorkspaceComponentRepository workspaceRepository,
            ImportToWorkspaceService importToWorkspace,
            ComponentFactoryResolver factoryResolver,
            ComponentTypeRegistry typeRegistry,
            DeleteDocumentInWorkspaceService workspaceDeletes
    ) {
        super(
                libraryRepository,
                workspaceRepository,
                importToWorkspace,
                factoryResolver,
                typeRegistry,
                workspaceDeletes
        );
    }

    @Override
    protected ImportedObjectDefinition createDefinition(
            BuildingLibraryObjectDocument source,
            LibraryImportContext context
    ) {
        return new ImportedObjectDefinition(
                source.getName(),
                new LinkedHashMap<>(source.getProperties())
        );
    }
}
