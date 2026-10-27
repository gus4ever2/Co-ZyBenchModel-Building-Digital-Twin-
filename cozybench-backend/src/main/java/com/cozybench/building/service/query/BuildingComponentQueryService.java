package com.cozybench.building.service.query;

import com.cozybench.building.dto.ComponentStateResponse;
import com.cozybench.building.model.type.ComponentCategory;
import com.cozybench.building.service.query.strategy.ComponentEditorQueryStrategy;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/** Routes each editor read request to the strategy for its component category. */
@Service
public class BuildingComponentQueryService {

    private final Map<ComponentCategory, ComponentEditorQueryStrategy> strategies;

    public BuildingComponentQueryService(List<ComponentEditorQueryStrategy> strategies) {
        Map<ComponentCategory, ComponentEditorQueryStrategy> indexed =
                new EnumMap<>(ComponentCategory.class);
        for (ComponentEditorQueryStrategy strategy : strategies) {
            // One strategy per category keeps editor-specific loading behavior explicit.
            if (indexed.put(strategy.editorCategory(), strategy) != null) {
                throw new IllegalStateException(
                        "Duplicate query strategy for " + strategy.editorCategory());
            }
        }
        this.strategies = Map.copyOf(indexed);
    }

    /** Loads the material editor through the material-specific query strategy. */
    public ComponentStateResponse materials(String ownerId, String selectedId) {
        return load(ComponentCategory.MATERIAL, ownerId, selectedId);
    }

    /** Loads the construction editor and its selectable material references. */
    public ComponentStateResponse constructions(String ownerId, String selectedId) {
        return load(ComponentCategory.CONSTRUCTION, ownerId, selectedId);
    }

    /** Loads the construction-set editor and its selectable construction references. */
    public ComponentStateResponse constructionSets(String ownerId, String selectedId) {
        return load(ComponentCategory.CONSTRUCTION_SET, ownerId, selectedId);
    }

    /** Finds the strategy registered for a category and delegates the read operation. */
    private ComponentStateResponse load(
            ComponentCategory category, String ownerId, String selectedId
    ) {
        ComponentEditorQueryStrategy strategy = strategies.get(category);
        if (strategy == null) {
            throw new IllegalStateException("No query strategy for " + category);
        }
        return strategy.load(ownerId, selectedId);
    }
}
