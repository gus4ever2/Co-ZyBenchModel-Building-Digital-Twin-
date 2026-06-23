package com.example.cozybench.model.enums;

import com.example.cozybench.model.TypeEnumInterface;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum SimulationTypeEnum implements TypeEnumInterface {
    RUN_PERIOD_AND_TIMESTEP("RUN_PERIOD_AND_TIMESTEP"),
    RUN_PERIOD("RunPeriod"),
    TIMESTEP("Timestep");

    @Getter
    private final String eppyName;
}