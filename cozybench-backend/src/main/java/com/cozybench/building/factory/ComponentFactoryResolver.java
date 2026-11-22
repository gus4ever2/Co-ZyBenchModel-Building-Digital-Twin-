package com.cozybench.building.factory;

import com.cozybench.building.model.type.ComponentType;
import com.cozybench.building.model.type.ComponentTypeRegistry;
import com.cozybench.building.model.type.ComponentTypePath;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Locale;

/**
 * Single entry point used by create, update, duplicate, and library import.
 * It resolves the canonical API type directly and selects its concrete factory.
 * The registry is assembled from every Spring-provided category factory.
 */
@Component
public final class ComponentFactoryResolver {

    private final ComponentTypeRegistry typeRegistry;
    private final Map<String, ComponentFactory> factoriesByType;

    public ComponentFactoryResolver(
            ComponentTypeRegistry typeRegistry,
            List<ComponentCategoryFactory> categoryFactories
    ) {
        this.typeRegistry = typeRegistry;
        this.factoriesByType = indexFactories(categoryFactories);
    }

    /** Resolves the canonical API type sent by the frontend. */
    public ComponentFactory resolve(String type) {
        return resolve(typeRegistry.resolve(type));
    }

    /** Compatibility overload for callers still holding the old path object. */
    public ComponentFactory resolve(ComponentTypePath path) {
        return resolve(path.type());
    }

    /** Resolves a known enum value through the type-keyed registry. */
    public ComponentFactory resolve(ComponentType type) {
        ComponentFactory factory = factoriesByType.get(normalize(type.apiName()));
        if (factory == null) {
            throw new IllegalArgumentException("No factory for component type: " + type.apiName());
        }
        return factory;
    }

    /** Indexes every concrete factory by its stable API type and rejects duplicates. */
    private Map<String, ComponentFactory> indexFactories(
            List<ComponentCategoryFactory> categoryFactories
    ) {
        Map<String, ComponentFactory> values = new LinkedHashMap<>();
        for (ComponentCategoryFactory categoryFactory : categoryFactories) {
            for (ComponentFactory factory : categoryFactory.factories().values()) {
                String key = normalize(factory.type().apiName());
                if (values.putIfAbsent(key, factory) != null) {
                    throw new IllegalStateException("More than one factory handles " + key);
                }
            }
        }
        return Map.copyOf(values);
    }

    private String normalize(String value) {
        return value.trim().toUpperCase(Locale.ROOT);
    }
}
