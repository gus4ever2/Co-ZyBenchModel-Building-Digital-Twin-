package com.example.cozybench.model.validationRecords.materials;

import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import lombok.Builder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Pattern;

@Builder
public record WindowGasPropertiesIdfObjectRecord(
        @NotBlank(message = "Name is required")
        String Name,
        @NotBlank(message = "Gas Type is required")
        @Pattern(regexp = "Air|Argon|Krypton|Xenon|Custom", message = "Invalid Gas Type")
        String Gas_Type,
        @NotNull(message = "Thickness is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Thickness must be greater than 0.0")
        Double Thickness,
        Double Conductivity_Coefficient_A,
        Double Conductivity_Coefficient_B,
        Double Conductivity_Coefficient_C,
        @DecimalMin(value = "0.0", inclusive = false, message = "Viscosity Coefficient A must be greater than 0.0")
        Double Viscosity_Coefficient_A,
        Double Viscosity_Coefficient_B,
        Double Viscosity_Coefficient_C,
        @DecimalMin(value = "0.0", inclusive = false, message = "Specific Heat Coefficient A must be greater than 0.0")
        Double Specific_Heat_Coefficient_A,
        Double Specific_Heat_Coefficient_B,
        Double Specific_Heat_Coefficient_C,
        @DecimalMin(value = "20.0", message = "Molecular Weight must be at least 20.0")
        @DecimalMax(value = "200.0", message = "Molecular Weight must be at most 200.0")
        Double Molecular_Weight,
        @DecimalMin(value = "1.0", inclusive = false, message = "Specific Heat Ratio must be greater than 1.0")
        Double Specific_Heat_Ratio
) implements IdfObjectRecord {}
