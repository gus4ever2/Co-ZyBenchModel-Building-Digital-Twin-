package com.example.cozybench.model.factory;

import com.example.cozybench.model.enums.*;
import com.example.cozybench.model.factory.constructionSet.ConstructionSetFactoryRegistry;
import com.example.cozybench.model.factory.constructions.ConstructionFactoryRegistry;
import com.example.cozybench.model.factory.materials.*;
import com.example.cozybench.model.factory.plants.PlantFactoryRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RegistryResolver {

    private final MaterialFactoryRegistry materialFactoryRegistry;
    private final WindowMaterialFactoryRegistry windowMaterialFactoryRegistry;
    private final ConstructionFactoryRegistry constructionFactoryRegistry;
    private final ConstructionSetFactoryRegistry constructionSetFactoryRegistry;
    private final PlantFactoryRegistry plantFactoryRegistry;

    public FactoryInterface<?> getFactory(String enumName) {


        if (enumName.startsWith("WINDOW")) {
            WindowMaterialTypeEnum type =
                    WindowMaterialTypeEnum.valueOf(enumName);

            return this.windowMaterialFactoryRegistry.getFactory(type);
        }

        else if (enumName.startsWith("MATERIAL")) {
            MaterialTypeEnum type =
                    MaterialTypeEnum.valueOf(enumName);

            return this.materialFactoryRegistry.getFactory(type);
        }

        else if (enumName.startsWith("CONSTRUCTION_SET")) {
            ConstructionSetTypeEnum type =
                    ConstructionSetTypeEnum.valueOf(enumName);

            return this.constructionSetFactoryRegistry.getFactory(type);
        }

        else if (enumName.startsWith("CONSTRUCTION")) {
            ConstructionTypeEnum type =
                    ConstructionTypeEnum.valueOf(enumName);

            return this.constructionFactoryRegistry.getFactory(type);
        }
        else if (enumName.startsWith("PLANT")) {
            PlantEnum type =
                    PlantEnum.valueOf(enumName);

            return this.plantFactoryRegistry.getFactory(type);
        }

        throw new IllegalArgumentException("Unsupported material type: " + enumName);
    }
}
