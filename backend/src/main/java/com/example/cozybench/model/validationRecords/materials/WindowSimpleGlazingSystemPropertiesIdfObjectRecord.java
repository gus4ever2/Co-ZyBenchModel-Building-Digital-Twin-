package com.example.cozybench.model.validationRecords.materials;

import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import lombok.Builder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;

@Builder
public record WindowSimpleGlazingSystemPropertiesIdfObjectRecord(
        @NotBlank(message = "Name is required")
        String Name,
        @NotNull(message = "U-Factor is required")
        @DecimalMin(value = "0", inclusive = false, message = "U-Factor must be greater than 0")
        Double U_Factor,
        @NotNull(message = "Solar Heat Gain Coefficient is required")
        @DecimalMin(value = "0", inclusive = false, message = "Solar Heat Gain Coefficient must be greater than 0")
        @DecimalMax(value = "1", inclusive = false, message = "Solar Heat Gain Coefficient must be less than 1")
        Double Solar_Heat_Gain_Coefficient,
        @DecimalMin(value = "0", inclusive = false, message = "Visible Transmittance must be greater than 0")
        @DecimalMax(value = "1", inclusive = false, message = "Visible Transmittance must be less than 1")
        Double Visible_Transmittance
) implements IdfObjectRecord {}
