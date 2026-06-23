package com.example.cozybench.model.factory.materials;

import com.example.cozybench.model.enums.WindowMaterialTypeEnum;
import com.example.cozybench.model.factory.FactoryInterface;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.Map;

@Component
public class WindowMaterialFactoryRegistry {

    private final Map<WindowMaterialTypeEnum, FactoryInterface<?>> factories =
            new EnumMap<>(WindowMaterialTypeEnum.class);

    public WindowMaterialFactoryRegistry() {
        factories.put(WindowMaterialTypeEnum.WINDOW_MATERIAL_BLIND, new WindowMaterialBlindFactory());
        factories.put(WindowMaterialTypeEnum.WINDOW_MATERIAL_DAYLIGHT_REDIRECTION_DEVICE, new WindowMaterialDaylightRedirectionDeviceFactory());
        factories.put(WindowMaterialTypeEnum.WINDOW_MATERIAL_GAS_MIXTURE, new WindowMaterialGasMixtureFactory());
        factories.put(WindowMaterialTypeEnum.WINDOW_MATERIAL_GAS, new WindowMaterialGasFactory());
        factories.put(WindowMaterialTypeEnum.WINDOW_MATERIAL_GLAZING, new WindowMaterialGlazingFactory());
        factories.put(WindowMaterialTypeEnum.WINDOW_MATERIAL_GLAZING_REFRACTION_EXTINCTION_METHOD, new WindowMaterialGlazingRefractionExtinctionMethodFactory());
        factories.put(WindowMaterialTypeEnum.WINDOW_MATERIAL_SCREEN, new WindowMaterialScreenFactory());
        factories.put(WindowMaterialTypeEnum.WINDOW_MATERIAL_SHADE, new WindowMaterialShadeFactory());
        factories.put(WindowMaterialTypeEnum.WINDOW_MATERIAL_SIMPLE_GLAZING_SYSTEM, new WindowMaterialSimpleGlazingSystemFactory());
    }

    public FactoryInterface<?> getFactory(WindowMaterialTypeEnum type) {
        FactoryInterface<?> factory = factories.get(type);

        if (factory == null) {
            throw new IllegalArgumentException("No window material factory found for type: " + type);
        }

        return factory;
    }
}