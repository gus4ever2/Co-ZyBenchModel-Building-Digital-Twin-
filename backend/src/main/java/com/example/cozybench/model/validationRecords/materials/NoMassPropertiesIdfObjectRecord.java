package com.example.cozybench.model.validationRecords.materials;

import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import lombok.Builder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Pattern;

@Builder
public record NoMassPropertiesIdfObjectRecord(
        @NotBlank(message = "Name is required")
        String Name,
        @NotBlank(message = "Roughness is required")
        @Pattern(regexp = "VeryRough|Rough|MediumRough|MediumSmooth|Smooth|VerySmooth", message = "Invalid Roughness")
        String Roughness,
        @NotNull(message = "Thermal Resistance is required")
        @DecimalMin(value = ".001", message = "Thermal Resistance must be at least .001")
        Double Thermal_Resistance,
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
