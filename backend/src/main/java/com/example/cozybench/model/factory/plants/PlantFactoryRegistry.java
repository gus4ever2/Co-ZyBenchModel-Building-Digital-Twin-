package com.example.cozybench.model.factory.plants;

import com.example.cozybench.model.enums.PlantEnum;
import com.example.cozybench.model.factory.AbstractFactory;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Component
public class PlantFactoryRegistry {

    private final Map<PlantEnum, AbstractFactory<? extends IdfObjectRecord>> factories;

    public PlantFactoryRegistry(List<AbstractFactory<? extends IdfObjectRecord>> factoryList) {
        this.factories = new EnumMap<>(PlantEnum.class);

        for (AbstractFactory<? extends IdfObjectRecord> factory : factoryList) {
            if (factory.getType() instanceof PlantEnum plantEnum) {
                this.factories.put(plantEnum, factory);
            }
        }
    }

    public AbstractFactory<? extends IdfObjectRecord> getFactory(PlantEnum plantEnum) {
        AbstractFactory<? extends IdfObjectRecord> factory = factories.get(plantEnum);

        if (factory == null) {
            throw new IllegalArgumentException("No factory found for plant type: " + plantEnum);
        }

        return factory;
    }
}
