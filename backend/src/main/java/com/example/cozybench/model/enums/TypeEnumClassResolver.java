package com.example.cozybench.model.enums;

import com.example.cozybench.model.TypeEnumInterface;
import lombok.Getter;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class TypeEnumClassResolver {

    @Getter
    private final Map<String, Class<? extends Enum<?>>> enumClasses = Map.of(
            "ConstructionSetTypeEnum", ConstructionSetTypeEnum.class,
            "ConstructionTypeEnum", ConstructionTypeEnum.class,
            "LoadTypeEnum", LoadTypeEnum.class,
            "MaterialTypeEnum", MaterialTypeEnum.class,
            "PlantEnum", PlantEnum.class,
            "SimulationTypeEnum", SimulationTypeEnum.class,
            "WindowMaterialTypeEnum", WindowMaterialTypeEnum.class
    );

    public TypeEnumInterface resolve(String enumClassName, String enumValue) {
        Class<? extends Enum<?>> enumClass = enumClasses.get(enumClassName);

        if (enumClass == null) {
            throw new IllegalArgumentException("Unsupported enum class: " + enumClassName);
        }

        for (Enum<?> constant : enumClass.getEnumConstants()) {
            if (constant.name().equals(enumValue)) {
                return (TypeEnumInterface) constant;
            }
        }

        throw new IllegalArgumentException(
                "Unsupported enum value: " + enumValue + " for enum class: " + enumClassName
        );
    }
}