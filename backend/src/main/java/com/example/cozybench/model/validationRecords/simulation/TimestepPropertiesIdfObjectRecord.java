package com.example.cozybench.model.validationRecords.simulation;

import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import lombok.Builder;

@Builder
public record TimestepPropertiesIdfObjectRecord(
        Integer Number_of_Timesteps_per_Hour
) implements IdfObjectRecord {}
