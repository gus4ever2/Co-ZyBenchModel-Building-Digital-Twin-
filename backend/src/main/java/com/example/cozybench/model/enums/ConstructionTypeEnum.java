package com.example.cozybench.model.enums;

import com.example.cozybench.model.TypeEnumInterface;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum ConstructionTypeEnum implements TypeEnumInterface {
    CONSTRUCTION("CONSTRUCTION"),


    CONSTRUCTION_AIR_BOUNDARY("CONSTRUCTION:AIRBOUNDARY"),

    CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE("CONSTRUCTIONPROPERTY:INTERNALHEATSOURCE"),

    CONSTRUCTION_CFACTOR_UNDERGROUND_WALL("CONSTRUCTION:CFACTORUNDERGROUNDWALL"),

    CONSTRUCTION_FFACTOR_GROUND_FLOOR("CONSTRUCTION:FFACTORGROUNDFLOOR");

    @Getter
    private final String eppyName;
}