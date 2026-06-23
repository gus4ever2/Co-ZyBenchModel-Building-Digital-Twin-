package com.example.cozybench.model.enums;

import com.example.cozybench.model.TypeEnumInterface;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum ConstructionSetTypeEnum implements TypeEnumInterface {
    CONSTRUCTION_SET("construction_set");

    @Getter
    private final String eppyName;
}
