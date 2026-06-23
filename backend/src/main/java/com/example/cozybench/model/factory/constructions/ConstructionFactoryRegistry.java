package com.example.cozybench.model.factory.constructions;

import com.example.cozybench.model.enums.ConstructionTypeEnum;
import com.example.cozybench.model.factory.FactoryInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.Map;

@Component
public class ConstructionFactoryRegistry {

    private final Map<ConstructionTypeEnum, FactoryInterface<?>> factories =
            new EnumMap<>(ConstructionTypeEnum.class);

    public ConstructionFactoryRegistry() {
        factories.put(ConstructionTypeEnum.CONSTRUCTION, new ConstructionMaterialFactory());
        factories.put(ConstructionTypeEnum.CONSTRUCTION_AIR_BOUNDARY, new ConstructionAirBoundaryFactory());
        factories.put(ConstructionTypeEnum.CONSTRUCTION_CFACTOR_UNDERGROUND_WALL, new ConstructionCfactorUndergroundWallFactory());
        factories.put(ConstructionTypeEnum.CONSTRUCTION_FFACTOR_GROUND_FLOOR, new ConstructionFfactorGroundFloorFactory());
        factories.put(ConstructionTypeEnum.CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE, new ConstructionPropertyInternalHeatSourceFactory());
    }

    public FactoryInterface<?> getFactory(ConstructionTypeEnum type) {
        FactoryInterface<?> factory = factories.get(type);

        if (factory == null) {
            throw new IllegalArgumentException("No construction factory found for type: " + type);
        }

        return factory;
    }
}
