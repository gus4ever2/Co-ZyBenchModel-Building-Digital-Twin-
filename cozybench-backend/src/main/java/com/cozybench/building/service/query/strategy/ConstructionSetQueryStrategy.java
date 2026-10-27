package com.cozybench.building.service.query.strategy;

import com.cozybench.building.model.type.ComponentCategory;
import com.cozybench.building.model.type.ComponentTypeRegistry;
import com.cozybench.building.repository.BuildingLibraryObjectRepository;
import com.cozybench.building.repository.WorkspaceComponentRepository;
import org.springframework.stereotype.Component;

/** Loads construction sets and the constructions available to assign to them. */
@Component
public final class ConstructionSetQueryStrategy extends AbstractComponentEditorQueryStrategy {

    public ConstructionSetQueryStrategy(
            WorkspaceComponentRepository workspaceRepository,
            BuildingLibraryObjectRepository libraryRepository,
            ComponentTypeRegistry typeRegistry
    ) {
        super(workspaceRepository, libraryRepository, typeRegistry);
    }

    @Override
    public ComponentCategory editorCategory() {
        return ComponentCategory.CONSTRUCTION_SET;
    }

    @Override
    protected ComponentCategory selectableCategory() {
        return ComponentCategory.CONSTRUCTION;
    }
}
