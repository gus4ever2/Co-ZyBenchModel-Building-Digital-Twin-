package com.cozybench.building.factory;

import com.cozybench.building.model.type.ComponentCategory;
import com.cozybench.building.model.type.ComponentType;
import com.cozybench.building.model.type.ComponentTypePath;
import com.cozybench.building.resolver.ComponentTypeHierarchyResolver;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * Single entry point used by create, update, duplicate, and library import.
 * It resolves the request's type path, then chooses the factory for its category.
 * That factory maps the type to its IDD record; defaults belong to the record.
 */
@Component
public final class ComponentFactoryResolver {

    private final ComponentTypeHierarchyResolver hierarchyResolver;
    private final Map<ComponentCategory, ComponentCategoryFactory> factoriesByCategory;

    public ComponentFactoryResolver(
            ComponentTypeHierarchyResolver hierarchyResolver,
            List<ComponentCategoryFactory> categoryFactories
    ) {
        this.hierarchyResolver = hierarchyResolver;
        this.factoriesByCategory = indexFactories(categoryFactories);
    }

    /** Resolves a user-facing domain/category/type path to its IDD record factory. */
    public ComponentFactory resolve(ComponentTypePath path) {
        return resolve(hierarchyResolver.resolve(path));
    }

    /** Selects the category factory first, then asks it for the exact component type. */
    public ComponentFactory resolve(ComponentType type) {
        // The category selects the correct family-specific factory before exact type lookup.
        ComponentCategoryFactory factory = factoriesByCategory.get(type.category());
        if (factory == null) {
            throw new IllegalArgumentException("No factory for category: " + type.category());
        }
        return factory.create(type);
    }

    /** Indexes Spring-provided factories and rejects duplicate handlers at startup. */
    private Map<ComponentCategory, ComponentCategoryFactory> indexFactories(
            List<ComponentCategoryFactory> categoryFactories
    ) {
        Map<ComponentCategory, ComponentCategoryFactory> values = new EnumMap<>(ComponentCategory.class);
        for (ComponentCategoryFactory factory : categoryFactories) {
            // Duplicate Spring beans for a category would make factory selection ambiguous.
            if (values.put(factory.category(), factory) != null) {
                throw new IllegalStateException("More than one factory handles " + factory.category());
            }
        }
        return Map.copyOf(values);
    }
}
