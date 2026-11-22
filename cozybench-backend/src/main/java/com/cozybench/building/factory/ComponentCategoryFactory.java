package com.cozybench.building.factory;

import com.cozybench.building.model.type.ComponentCategory;
import com.cozybench.building.model.type.ComponentType;

import java.util.Map;

/** Creates property factories for exactly one component category. */
public interface ComponentCategoryFactory {

    ComponentCategory category();

    ComponentFactory create(ComponentType type);

    /** All concrete type factories owned by this category, exposed for the global registry. */
    Map<ComponentType, ComponentFactory> factories();
}
