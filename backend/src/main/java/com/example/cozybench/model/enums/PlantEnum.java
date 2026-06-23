package com.example.cozybench.model.enums;

import com.example.cozybench.model.TypeEnumInterface;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum PlantEnum implements TypeEnumInterface {
    PLANT_YPLANT_QMC_CO2_SIMULATION("PLANT_YPLANT_QMC_CO2_SIMULATION");

    @Getter
    private final String eppyName;
}
