package com.cozybench.building.model.type;

import java.util.Set;

/** Top-level area in which a component can be created or imported. */
public enum ComponentDomain {
    CONSTRUCTIONS(Set.of(
            ComponentCategory.MATERIAL,
            ComponentCategory.CONSTRUCTION,
            ComponentCategory.CONSTRUCTION_SET
    ));

    private final Set<ComponentCategory> categories;

    ComponentDomain(Set<ComponentCategory> categories) {
        this.categories = categories;
    }

    /** Checks whether a category is valid beneath this domain in the request path. */
    public boolean supports(ComponentCategory category) {
        return categories.contains(category);
    }
}
