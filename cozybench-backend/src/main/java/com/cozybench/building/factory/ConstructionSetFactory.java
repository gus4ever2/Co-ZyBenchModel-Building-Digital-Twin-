package com.cozybench.building.factory;

import com.cozybench.building.idfobject.constructionset.ConstructionSet;
import com.cozybench.building.model.type.ComponentCategory;
import com.cozybench.building.model.type.ComponentType;
import com.cozybench.building.model.type.ConstructionSetType;
import jakarta.validation.Validator;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

/** Creates the factory for the application-level construction-set object. */
@Component
public final class ConstructionSetFactory extends AbstractComponentCategoryFactory {
    private final Map<ComponentType, ComponentFactory> definitions;

    public ConstructionSetFactory(Validator validator) {
        super(validator);
        Map<ComponentType, ComponentFactory> values = new LinkedHashMap<>();
        values.put(ConstructionSetType.CONSTRUCTION_SET, definition(
                ConstructionSetType.CONSTRUCTION_SET, ConstructionSet.class));
        this.definitions = Map.copyOf(values);
    }

    @Override
    public ComponentCategory category() {
        return ComponentCategory.CONSTRUCTION_SET;
    }

    @Override
    protected Map<ComponentType, ComponentFactory> definitions() {
        return definitions;
    }
}
