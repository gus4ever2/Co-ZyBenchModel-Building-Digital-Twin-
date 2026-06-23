package com.example.cozybench.model.factory.constructionSet;

import com.example.cozybench.model.enums.ConstructionSetTypeEnum;
import com.example.cozybench.model.factory.FactoryInterface;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.Map;

@Component
public class ConstructionSetFactoryRegistry {

    private final Map<ConstructionSetTypeEnum, FactoryInterface<?>> factories =
            new EnumMap<>(ConstructionSetTypeEnum.class);

    public ConstructionSetFactoryRegistry() {
        factories.put(
                ConstructionSetTypeEnum.CONSTRUCTION_SET,
                new ConstructionSetFactory()
        );
    }

    public FactoryInterface<?> getFactory(ConstructionSetTypeEnum type) {
        FactoryInterface<?> factory = factories.get(type);

        if (factory == null) {
            throw new IllegalArgumentException(
                    "No construction set factory found for type: " + type
            );
        }

        return factory;
    }
}
