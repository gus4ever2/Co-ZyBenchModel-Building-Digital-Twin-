package com.example.cozybench.model.validationRecords.materials;

import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import lombok.Builder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Pattern;

@Builder
public record WindowScreenPropertiesIdfObjectRecord(
        @NotBlank(message = "Name is required")
        String Name,
        @Pattern(regexp = "DoNotModel|ModelAsDirectBeam|ModelAsDiffuse", message = "Invalid Reflected Beam Transmittance Accounting Method")
        String Reflected_Beam_Transmittance_Accounting_Method,
        @NotNull(message = "Diffuse Solar Reflectance is required")
        @DecimalMin(value = "0", message = "Diffuse Solar Reflectance must be at least 0")
        @DecimalMax(value = "1", inclusive = false, message = "Diffuse Solar Reflectance must be less than 1")
        Double Diffuse_Solar_Reflectance,
        @NotNull(message = "Diffuse Visible Reflectance is required")
        @DecimalMin(value = "0", message = "Diffuse Visible Reflectance must be at least 0")
        @DecimalMax(value = "1", inclusive = false, message = "Diffuse Visible Reflectance must be less than 1")
        Double Diffuse_Visible_Reflectance,
        @DecimalMin(value = "0", inclusive = false, message = "Thermal Hemispherical Emissivity must be greater than 0")
        @DecimalMax(value = "1", inclusive = false, message = "Thermal Hemispherical Emissivity must be less than 1")
        Double Thermal_Hemispherical_Emissivity,
        @DecimalMin(value = "0", inclusive = false, message = "Conductivity must be greater than 0")
        Double Conductivity,
        @NotNull(message = "Screen Material Spacing is required")
        @DecimalMin(value = "0", inclusive = false, message = "Screen Material Spacing must be greater than 0")
        Double Screen_Material_Spacing,
        @NotNull(message = "Screen Material Diameter is required")
        @DecimalMin(value = "0", inclusive = false, message = "Screen Material Diameter must be greater than 0")
        Double Screen_Material_Diameter,
        @DecimalMin(value = "0.001", message = "Screen to Glass Distance must be at least 0.001")
        @DecimalMax(value = "1.0", message = "Screen to Glass Distance must be at most 1.0")
        Double Screen_to_Glass_Distance,
        @DecimalMin(value = "0.0", message = "Top Opening Multiplier must be at least 0.0")
        @DecimalMax(value = "1.0", message = "Top Opening Multiplier must be at most 1.0")
        Double Top_Opening_Multiplier,
        @DecimalMin(value = "0.0", message = "Bottom Opening Multiplier must be at least 0.0")
        @DecimalMax(value = "1.0", message = "Bottom Opening Multiplier must be at most 1.0")
        Double Bottom_Opening_Multiplier,
        @DecimalMin(value = "0.0", message = "Left Side Opening Multiplier must be at least 0.0")
        @DecimalMax(value = "1.0", message = "Left Side Opening Multiplier must be at most 1.0")
        Double Left_Side_Opening_Multiplier,
        @DecimalMin(value = "0.0", message = "Right Side Opening Multiplier must be at least 0.0")
        @DecimalMax(value = "1.0", message = "Right Side Opening Multiplier must be at most 1.0")
        Double Right_Side_Opening_Multiplier,
        @Pattern(regexp = "0|1|2|3|5", message = "Invalid Angle of Resolution for Screen Transmittance Output Map")
        String Angle_of_Resolution_for_Screen_Transmittance_Output_Map
) implements IdfObjectRecord {}
