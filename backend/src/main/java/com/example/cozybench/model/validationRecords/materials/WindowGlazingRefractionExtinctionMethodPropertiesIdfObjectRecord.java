package com.example.cozybench.model.validationRecords.materials;

import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import lombok.Builder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Pattern;

@Builder
public record WindowGlazingRefractionExtinctionMethodPropertiesIdfObjectRecord(
        @NotBlank(message = "Name is required")
        String Name,
        @NotNull(message = "Thickness is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Thickness must be greater than 0.0")
        Double Thickness,
        @NotNull(message = "Solar Index of Refraction is required")
        @DecimalMin(value = "1.0", inclusive = false, message = "Solar Index of Refraction must be greater than 1.0")
        Double Solar_Index_of_Refraction,
        @NotNull(message = "Solar Extinction Coefficient is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Solar Extinction Coefficient must be greater than 0.0")
        Double Solar_Extinction_Coefficient,
        @NotNull(message = "Visible Index of Refraction is required")
        @DecimalMin(value = "1.0", inclusive = false, message = "Visible Index of Refraction must be greater than 1.0")
        Double Visible_Index_of_Refraction,
        @NotNull(message = "Visible Extinction Coefficient is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Visible Extinction Coefficient must be greater than 0.0")
        Double Visible_Extinction_Coefficient,
        @DecimalMin(value = "0.0", message = "Infrared Transmittance at Normal Incidence must be at least 0.0")
        @DecimalMax(value = "1.0", inclusive = false, message = "Infrared Transmittance at Normal Incidence must be less than 1.0")
        Double Infrared_Transmittance_at_Normal_Incidence,
        @DecimalMin(value = "0.0", inclusive = false, message = "Infrared Hemispherical Emissivity must be greater than 0.0")
        @DecimalMax(value = "1.0", inclusive = false, message = "Infrared Hemispherical Emissivity must be less than 1.0")
        Double Infrared_Hemispherical_Emissivity,
        @DecimalMin(value = "0.0", inclusive = false, message = "Conductivity must be greater than 0.0")
        Double Conductivity,
        @DecimalMin(value = "0.0", inclusive = false, message = "Dirt Correction Factor for Solar and Visible Transmittance must be greater than 0.0")
        @DecimalMax(value = "1.0", message = "Dirt Correction Factor for Solar and Visible Transmittance must be at most 1.0")
        Double Dirt_Correction_Factor_for_Solar_and_Visible_Transmittance,
        @Pattern(regexp = "No|Yes", message = "Invalid Solar Diffusing")
        String Solar_Diffusing
) implements IdfObjectRecord {}
