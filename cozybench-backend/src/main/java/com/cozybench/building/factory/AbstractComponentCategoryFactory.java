package com.cozybench.building.factory;

import com.cozybench.building.model.type.ComponentCategory;
import com.cozybench.building.model.type.ComponentType;
import com.cozybench.building.model.validation.IddPropertiesRecord;
import jakarta.validation.Validator;

import java.util.Map;

/** Shared validator wiring and category guard for one component category's IDD factories. */
abstract class AbstractComponentCategoryFactory implements ComponentCategoryFactory {
    private final Validator validator;

    AbstractComponentCategoryFactory(Validator validator) {
        this.validator = validator;
    }

    protected final <T extends Record & IddPropertiesRecord> ComponentFactory definition(
            ComponentType type,
            Class<T> recordType
    ) {
        // The record constructor owns defaults; this factory handles conversion and validation.
        return new IddComponentFactory<>(type, recordType, validator);
    }

    protected final ComponentFactory requireFactory(
            Map<ComponentType, ComponentFactory> definitions,
            ComponentType type
    ) {
        // Reject cross-category requests before consulting this factory's type map.
        if (type.category() != category()) {
            throw new IllegalArgumentException("Factory for " + category() + " cannot create " + type.apiName());
        }
        ComponentFactory factory = definitions.get(type);
        if (factory == null) {
            throw new IllegalArgumentException("No factory configured for " + type.apiName());
        }
        return factory;
    }

    /** Supplies the exact types served by this category-specific factory. */
    protected abstract Map<ComponentType, ComponentFactory> definitions();

    @Override
    public final ComponentFactory create(ComponentType type) {
        return requireFactory(definitions(), type);
    }
}
