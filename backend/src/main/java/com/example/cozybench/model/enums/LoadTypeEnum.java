package com.example.cozybench.model.enums;

import com.example.cozybench.model.TypeEnumInterface;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Arrays;

@RequiredArgsConstructor
public enum LoadTypeEnum implements TypeEnumInterface {

PEOPLE("PEOPLE"),

LIGHTS("LIGHTS"),

ELECTRIC_EQUIPMENT("ELECTRICEQUIPMENT"),

GAS_EQUIPMENT("GASEQUIPMENT"),

STEAM_EQUIPMENT("STEAMEQUIPMENT"),

OTHER_EQUIPMENT("OTHEREQUIPMENT"),

INTERNAL_MASS("INTERNALMASS"),

WATER_USE_EQUIPMENT("WATERUSE:EQUIPMENT");

    @Getter
    private final String eppyName;


    public static LoadTypeEnum fromEppyName(String eppyName) {
        return Arrays.stream(values())
                .filter(type -> type.eppyName.equalsIgnoreCase(eppyName))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported load type: " + eppyName));
    }
}
