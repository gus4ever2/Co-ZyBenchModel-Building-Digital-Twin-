package com.example.cozybench.model.validationRecords.constructions;

import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import jakarta.validation.constraints.*;
import lombok.Builder;


@Builder
public record ConstructionMaterialPropertiesIdfObjectRecord(
        @NotBlank(message = "Name is required")
        String Name,

        @NotBlank(message = "Outside Layer is required")
        String Outside_Layer,

        String Layer_2,
        String Layer_3,
        String Layer_4,
        String Layer_5,
        String Layer_6,
        String Layer_7,
        String Layer_8,
        String Layer_9,
        String Layer_10
) implements IdfObjectRecord {}
