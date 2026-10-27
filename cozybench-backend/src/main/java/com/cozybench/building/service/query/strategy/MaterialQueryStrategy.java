package com.cozybench.building.service.query.strategy;

import com.cozybench.building.model.type.ComponentCategory;
import com.cozybench.building.model.type.ComponentTypeRegistry;
import com.cozybench.building.repository.BuildingLibraryObjectRepository;
import com.cozybench.building.repository.WorkspaceComponentRepository;
import org.springframework.stereotype.Component;

/** Loads material editor data; materials do not select other workspace components. */
@Component
public final class MaterialQueryStrategy extends AbstractComponentEditorQueryStrategy {

    public MaterialQueryStrategy(
            WorkspaceComponentRepository workspaceRepository,
            BuildingLibraryObjectRepository libraryRepository,
            ComponentTypeRegistry typeRegistry
    ) {
        super(workspaceRepository, libraryRepository, typeRegistry);
    }

    @Override
    public ComponentCategory editorCategory() {
        return ComponentCategory.MATERIAL;
    }

    @Override
    protected ComponentCategory selectableCategory() {
        return null;
    }
}
