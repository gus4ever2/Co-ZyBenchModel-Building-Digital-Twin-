package com.cozybench.building.service.query.strategy;

import com.cozybench.building.model.type.ComponentCategory;
import com.cozybench.building.model.type.ComponentTypeRegistry;
import com.cozybench.building.repository.BuildingLibraryObjectRepository;
import com.cozybench.building.repository.WorkspaceComponentRepository;
import org.springframework.stereotype.Component;

/** Loads constructions and the materials that can be assigned to their layers. */
@Component
public final class ConstructionQueryStrategy extends AbstractComponentEditorQueryStrategy {

    public ConstructionQueryStrategy(
            WorkspaceComponentRepository workspaceRepository,
            BuildingLibraryObjectRepository libraryRepository,
            ComponentTypeRegistry typeRegistry
    ) {
        super(workspaceRepository, libraryRepository, typeRegistry);
    }

    @Override
    public ComponentCategory editorCategory() {
        return ComponentCategory.CONSTRUCTION;
    }

    @Override
    protected ComponentCategory selectableCategory() {
        return ComponentCategory.MATERIAL;
    }
}
