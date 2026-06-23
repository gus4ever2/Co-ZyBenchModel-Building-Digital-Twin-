package com.example.cozybench.model.validationRecords.constructions;

import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import jakarta.validation.constraints.*;
import lombok.Builder;


@Builder
public record ConstructionCfactorUndergroundWallPropertiesIdfObjectRecord(
        @NotBlank(message = "Name is required")
        String Name,

        @NotNull(message = "C-Factor is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "C-Factor must be greater than 0")
        Double C_Factor,

        @NotNull(message = "Height is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Height must be greater than 0")
        Double Height
) implements IdfObjectRecord {}
