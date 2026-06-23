package com.example.cozybench.model.validationRecords.materials;

import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import lombok.Builder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Pattern;

@Builder
public record WindowBlindPropertiesIdfObjectRecord(
        @NotBlank(message = "Name is required")
        String Name,
        @Pattern(regexp = "Horizontal|Vertical", message = "Invalid Slat Orientation")
        String Slat_Orientation,
        @NotNull(message = "Slat Width is required")
        @DecimalMin(value = "0", inclusive = false, message = "Slat Width must be greater than 0")
        @DecimalMax(value = "1", message = "Slat Width must be at most 1")
        Double Slat_Width,
        @NotNull(message = "Slat Separation is required")
        @DecimalMin(value = "0", inclusive = false, message = "Slat Separation must be greater than 0")
        @DecimalMax(value = "1", message = "Slat Separation must be at most 1")
        Double Slat_Separation,
        @DecimalMin(value = "0", inclusive = false, message = "Slat Thickness must be greater than 0")
        @DecimalMax(value = "0.1", message = "Slat Thickness must be at most 0.1")
        Double Slat_Thickness,
        @DecimalMin(value = "0", message = "Slat Angle must be at least 0")
        @DecimalMax(value = "180", message = "Slat Angle must be at most 180")
        Double Slat_Angle,
        @DecimalMin(value = "0", inclusive = false, message = "Slat Conductivity must be greater than 0")
        Double Slat_Conductivity,
        @DecimalMin(value = "0", message = "Slat Beam Solar Transmittance must be at least 0")
        @DecimalMax(value = "1", inclusive = false, message = "Slat Beam Solar Transmittance must be less than 1")
        Double Slat_Beam_Solar_Transmittance,
        @NotNull(message = "Front Side Slat Beam Solar Reflectance is required")
        @DecimalMin(value = "0", message = "Front Side Slat Beam Solar Reflectance must be at least 0")
        @DecimalMax(value = "1", inclusive = false, message = "Front Side Slat Beam Solar Reflectance must be less than 1")
        Double Front_Side_Slat_Beam_Solar_Reflectance,
        @NotNull(message = "Back Side Slat Beam Solar Reflectance is required")
        @DecimalMin(value = "0", message = "Back Side Slat Beam Solar Reflectance must be at least 0")
        @DecimalMax(value = "1", inclusive = false, message = "Back Side Slat Beam Solar Reflectance must be less than 1")
        Double Back_Side_Slat_Beam_Solar_Reflectance,
        @DecimalMin(value = "0", message = "Slat Diffuse Solar Transmittance must be at least 0")
        @DecimalMax(value = "1", inclusive = false, message = "Slat Diffuse Solar Transmittance must be less than 1")
        Double Slat_Diffuse_Solar_Transmittance,
        @NotNull(message = "Front Side Slat Diffuse Solar Reflectance is required")
        @DecimalMin(value = "0", message = "Front Side Slat Diffuse Solar Reflectance must be at least 0")
        @DecimalMax(value = "1", inclusive = false, message = "Front Side Slat Diffuse Solar Reflectance must be less than 1")
        Double Front_Side_Slat_Diffuse_Solar_Reflectance,
        @NotNull(message = "Back Side Slat Diffuse Solar Reflectance is required")
        @DecimalMin(value = "0", message = "Back Side Slat Diffuse Solar Reflectance must be at least 0")
        @DecimalMax(value = "1", inclusive = false, message = "Back Side Slat Diffuse Solar Reflectance must be less than 1")
        Double Back_Side_Slat_Diffuse_Solar_Reflectance,
        @NotNull(message = "Slat Beam Visible Transmittance is required")
        @DecimalMin(value = "0", message = "Slat Beam Visible Transmittance must be at least 0")
        @DecimalMax(value = "1", inclusive = false, message = "Slat Beam Visible Transmittance must be less than 1")
        Double Slat_Beam_Visible_Transmittance,
        @DecimalMin(value = "0", message = "Front Side Slat Beam Visible Reflectance must be at least 0")
        @DecimalMax(value = "1", inclusive = false, message = "Front Side Slat Beam Visible Reflectance must be less than 1")
        Double Front_Side_Slat_Beam_Visible_Reflectance,
        @DecimalMin(value = "0", message = "Back Side Slat Beam Visible Reflectance must be at least 0")
        @DecimalMax(value = "1", inclusive = false, message = "Back Side Slat Beam Visible Reflectance must be less than 1")
        Double Back_Side_Slat_Beam_Visible_Reflectance,
        @DecimalMin(value = "0", message = "Slat Diffuse Visible Transmittance must be at least 0")
        @DecimalMax(value = "1", inclusive = false, message = "Slat Diffuse Visible Transmittance must be less than 1")
        Double Slat_Diffuse_Visible_Transmittance,
        @DecimalMin(value = "0", message = "Front Side Slat Diffuse Visible Reflectance must be at least 0")
        @DecimalMax(value = "1", inclusive = false, message = "Front Side Slat Diffuse Visible Reflectance must be less than 1")
        Double Front_Side_Slat_Diffuse_Visible_Reflectance,
        @DecimalMin(value = "0", message = "Back Side Slat Diffuse Visible Reflectance must be at least 0")
        @DecimalMax(value = "1", inclusive = false, message = "Back Side Slat Diffuse Visible Reflectance must be less than 1")
        Double Back_Side_Slat_Diffuse_Visible_Reflectance,
        @DecimalMin(value = "0", message = "Slat Infrared Hemispherical Transmittance must be at least 0")
        @DecimalMax(value = "1", inclusive = false, message = "Slat Infrared Hemispherical Transmittance must be less than 1")
        Double Slat_Infrared_Hemispherical_Transmittance,
        @DecimalMin(value = "0", message = "Front Side Slat Infrared Hemispherical Emissivity must be at least 0")
        @DecimalMax(value = "1", inclusive = false, message = "Front Side Slat Infrared Hemispherical Emissivity must be less than 1")
        Double Front_Side_Slat_Infrared_Hemispherical_Emissivity,
        @DecimalMin(value = "0", message = "Back Side Slat Infrared Hemispherical Emissivity must be at least 0")
        @DecimalMax(value = "1", inclusive = false, message = "Back Side Slat Infrared Hemispherical Emissivity must be less than 1")
        Double Back_Side_Slat_Infrared_Hemispherical_Emissivity,
        @DecimalMin(value = "0.01", message = "Blind to Glass Distance must be at least 0.01")
        @DecimalMax(value = "1.0", message = "Blind to Glass Distance must be at most 1.0")
        Double Blind_to_Glass_Distance,
        @DecimalMin(value = "0.0", message = "Blind Top Opening Multiplier must be at least 0.0")
        @DecimalMax(value = "1.0", message = "Blind Top Opening Multiplier must be at most 1.0")
        Double Blind_Top_Opening_Multiplier,
        @DecimalMin(value = "0.0", message = "Blind Bottom Opening Multiplier must be at least 0.0")
        @DecimalMax(value = "1.0", message = "Blind Bottom Opening Multiplier must be at most 1.0")
        Double Blind_Bottom_Opening_Multiplier,
        @DecimalMin(value = "0.0", message = "Blind Left Side Opening Multiplier must be at least 0.0")
        @DecimalMax(value = "1.0", message = "Blind Left Side Opening Multiplier must be at most 1.0")
        Double Blind_Left_Side_Opening_Multiplier,
        @DecimalMin(value = "0.0", message = "Blind Right Side Opening Multiplier must be at least 0.0")
        @DecimalMax(value = "1.0", message = "Blind Right Side Opening Multiplier must be at most 1.0")
        Double Blind_Right_Side_Opening_Multiplier,
        @DecimalMin(value = "0", message = "Minimum Slat Angle must be at least 0")
        @DecimalMax(value = "180", message = "Minimum Slat Angle must be at most 180")
        Double Minimum_Slat_Angle,
        @DecimalMin(value = "0", message = "Maximum Slat Angle must be at least 0")
        @DecimalMax(value = "180", message = "Maximum Slat Angle must be at most 180")
        Double Maximum_Slat_Angle
) implements IdfObjectRecord {}
