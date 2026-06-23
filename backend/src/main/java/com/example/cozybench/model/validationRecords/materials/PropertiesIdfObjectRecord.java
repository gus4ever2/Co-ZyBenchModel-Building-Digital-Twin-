package com.example.cozybench.model.validationRecords.materials;

import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import lombok.Builder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Pattern;

@Builder
public record PropertiesIdfObjectRecord(
        @NotBlank(message = "Name is required")
        String Name,
        @NotBlank(message = "Roughness is required")
        @Pattern(regexp = "VeryRough|Rough|MediumRough|MediumSmooth|Smooth|VerySmooth", message = "Invalid Roughness")
        String Roughness,
        @NotNull(message = "Thickness is required")
        @DecimalMin(value = "0", inclusive = false, message = "Thickness must be greater than 0")
        Double Thickness,
        @NotNull(message = "Conductivity is required")
        @DecimalMin(value = "0", inclusive = false, message = "Conductivity must be greater than 0")
        Double Conductivity,
        @NotNull(message = "Density is required")
        @DecimalMin(value = "0", inclusive = false, message = "Density must be greater than 0")
        Double Density,
        @NotNull(message = "Specific Heat is required")
        @DecimalMin(value = "100", message = "Specific Heat must be at least 100")
        Double Specific_Heat,
        @DecimalMin(value = "0", inclusive = false, message = "Thermal Absorptance must be greater than 0")
        @DecimalMax(value = "0.99999", message = "Thermal Absorptance must be at most 0.99999")
        Double Thermal_Absorptance,
        @DecimalMin(value = "0", message = "Solar Absorptance must be at least 0")
        @DecimalMax(value = "1", message = "Solar Absorptance must be at most 1")
        Double Solar_Absorptance,
        @DecimalMin(value = "0", message = "Visible Absorptance must be at least 0")
        @DecimalMax(value = "1", message = "Visible Absorptance must be at most 1")
        Double Visible_Absorptance
) implements IdfObjectRecord {}
