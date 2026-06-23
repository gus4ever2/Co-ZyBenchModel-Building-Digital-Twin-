package com.example.cozybench.model.validationRecords.materials;

import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import lombok.Builder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;

@Builder
public record AirGapPropertiesIdfObjectRecord(
        @NotBlank(message = "Name is required")
        String Name,
        @NotNull(message = "Thermal Resistance is required")
        @DecimalMin(value = "0", inclusive = false, message = "Thermal Resistance must be greater than 0")
        Double Thermal_Resistance
) implements IdfObjectRecord {}
