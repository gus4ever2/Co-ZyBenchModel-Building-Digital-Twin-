package com.cozybench.building.factory;

import com.cozybench.building.model.type.ComponentCategory;
import com.cozybench.building.model.type.ComponentType;

/** Creates property factories for exactly one component category. */
public interface ComponentCategoryFactory {

    ComponentCategory category();

    ComponentFactory create(ComponentType type);
}
