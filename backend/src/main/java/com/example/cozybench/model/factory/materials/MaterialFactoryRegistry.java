package com.example.cozybench.model.factory.materials;

import com.example.cozybench.model.enums.MaterialTypeEnum;
import com.example.cozybench.model.factory.FactoryInterface;
import org.springframework.stereotype.Component;
import java.util.EnumMap;
import java.util.Map;

@Component
public class MaterialFactoryRegistry {

    private final Map<MaterialTypeEnum, FactoryInterface<?>> factories =
            new EnumMap<>(MaterialTypeEnum.class);

    public MaterialFactoryRegistry() {
        factories.put(MaterialTypeEnum.MATERIAL, new MaterialFactory());
        factories.put(MaterialTypeEnum.MATERIAL_NO_MASS, new MaterialNoMassFactory());
        factories.put(MaterialTypeEnum.MATERIAL_AIR_GAP, new MaterialAirGapFactory());
        factories.put(MaterialTypeEnum.MATERIAL_INFRARED_TRANSPARENT, new MaterialInfraredTransparentFactory());
        factories.put(MaterialTypeEnum.MATERIAL_ROOF_VEGETATION, new MaterialRoofVegetationFactory());
    }

    public FactoryInterface<?> getFactory(MaterialTypeEnum type) {
        FactoryInterface<?> factory = factories.get(type);

        if (factory == null) {
            throw new IllegalArgumentException("No material factory found for type: " + type);
        }

        return factory;
    }
}
