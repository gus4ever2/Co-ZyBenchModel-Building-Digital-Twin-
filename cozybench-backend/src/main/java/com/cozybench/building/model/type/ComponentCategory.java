package com.cozybench.building.model.type;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

/** Editor-level grouping that selects the category factory and query strategy. */
public enum ComponentCategory {
    MATERIAL(MaterialType.class, WindowMaterialType.class),
    CONSTRUCTION(ConstructionType.class),
    CONSTRUCTION_SET(ConstructionSetType.class);

    private final List<Class<? extends Enum<?>>> typeEnums;

    @SafeVarargs
    ComponentCategory(Class<? extends Enum<?>>... typeEnums) {
        this.typeEnums = List.of(typeEnums);
    }

    /** Resolve a public API enum name only among the types valid for this category. */
    public ComponentType resolveType(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Component type is required");
        }

        String requestedName = value.trim().toUpperCase(Locale.ROOT);
        // Each category searches only its own enum families, so a valid name cannot resolve cross-category.
        for (Class<? extends Enum<?>> enumType : typeEnums) {
            ComponentType match = Arrays.stream(enumType.getEnumConstants())
                    .filter(ComponentType.class::isInstance)
                    .map(ComponentType.class::cast)
                    .filter(type -> type.apiName().equals(requestedName))
                    .findFirst()
                    .orElse(null);
            if (match != null) {
                return match;
            }
        }
        throw new IllegalArgumentException("Unsupported component type for " + this + ": " + value);
    }
}
