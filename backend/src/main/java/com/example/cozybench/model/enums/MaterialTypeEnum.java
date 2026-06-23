package com.example.cozybench.model.enums;

import com.example.cozybench.model.TypeEnumInterface;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum MaterialTypeEnum implements TypeEnumInterface {
    MATERIAL("MATERIAL"),

    MATERIAL_NO_MASS("MATERIAL:NOMASS"),

    MATERIAL_AIR_GAP("MATERIAL:AIRGAP"),

    MATERIAL_INFRARED_TRANSPARENT("MATERIAL:INFRAREDTRANSPARENT"),

    MATERIAL_ROOF_VEGETATION("MATERIAL:ROOFVEGETATION");

    @Getter
    private final String eppyName;
}