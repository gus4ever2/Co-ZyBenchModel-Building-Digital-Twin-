package com.example.cozybench.model.validationRecords.materials;

import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import lombok.Builder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Pattern;

@Builder
public record WindowGlazingPropertiesIdfObjectRecord(
        @NotBlank(message = "Name is required")
        String Name,
        @NotBlank(message = "Optical Data Type is required")
        @Pattern(regexp = "SpectralAverage|Spectral|BSDF|SpectralAndAngle", message = "Invalid Optical Data Type")
        String Optical_Data_Type,
        String Window_Glass_Spectral_Data_Set_Name,
        @NotNull(message = "Thickness is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Thickness must be greater than 0.0")
        Double Thickness,
        @DecimalMin(value = "0.0", message = "Solar Transmittance at Normal Incidence must be at least 0.0")
        @DecimalMax(value = "1.0", message = "Solar Transmittance at Normal Incidence must be at most 1.0")
        Double Solar_Transmittance_at_Normal_Incidence,
        @DecimalMin(value = "0.0", message = "Front Side Solar Reflectance at Normal Incidence must be at least 0.0")
        @DecimalMax(value = "1.0", message = "Front Side Solar Reflectance at Normal Incidence must be at most 1.0")
        Double Front_Side_Solar_Reflectance_at_Normal_Incidence,
        @DecimalMin(value = "0.0", message = "Back Side Solar Reflectance at Normal Incidence must be at least 0.0")
        @DecimalMax(value = "1.0", message = "Back Side Solar Reflectance at Normal Incidence must be at most 1.0")
        Double Back_Side_Solar_Reflectance_at_Normal_Incidence,
        @DecimalMin(value = "0.0", message = "Visible Transmittance at Normal Incidence must be at least 0.0")
        @DecimalMax(value = "1.0", message = "Visible Transmittance at Normal Incidence must be at most 1.0")
        Double Visible_Transmittance_at_Normal_Incidence,
        @DecimalMin(value = "0.0", message = "Front Side Visible Reflectance at Normal Incidence must be at least 0.0")
        @DecimalMax(value = "1.0", message = "Front Side Visible Reflectance at Normal Incidence must be at most 1.0")
        Double Front_Side_Visible_Reflectance_at_Normal_Incidence,
        @DecimalMin(value = "0.0", message = "Back Side Visible Reflectance at Normal Incidence must be at least 0.0")
        @DecimalMax(value = "1.0", message = "Back Side Visible Reflectance at Normal Incidence must be at most 1.0")
        Double Back_Side_Visible_Reflectance_at_Normal_Incidence,
        @DecimalMin(value = "0.0", message = "Infrared Transmittance at Normal Incidence must be at least 0.0")
        @DecimalMax(value = "1.0", message = "Infrared Transmittance at Normal Incidence must be at most 1.0")
        Double Infrared_Transmittance_at_Normal_Incidence,
        @DecimalMin(value = "0.0", inclusive = false, message = "Front Side Infrared Hemispherical Emissivity must be greater than 0.0")
        @DecimalMax(value = "1.0", inclusive = false, message = "Front Side Infrared Hemispherical Emissivity must be less than 1.0")
        Double Front_Side_Infrared_Hemispherical_Emissivity,
        @DecimalMin(value = "0.0", inclusive = false, message = "Back Side Infrared Hemispherical Emissivity must be greater than 0.0")
        @DecimalMax(value = "1.0", inclusive = false, message = "Back Side Infrared Hemispherical Emissivity must be less than 1.0")
        Double Back_Side_Infrared_Hemispherical_Emissivity,
        @DecimalMin(value = "0.0", inclusive = false, message = "Conductivity must be greater than 0.0")
        Double Conductivity,
        @DecimalMin(value = "0.0", inclusive = false, message = "Dirt Correction Factor for Solar and Visible Transmittance must be greater than 0.0")
        @DecimalMax(value = "1.0", message = "Dirt Correction Factor for Solar and Visible Transmittance must be at most 1.0")
        Double Dirt_Correction_Factor_for_Solar_and_Visible_Transmittance,
        @Pattern(regexp = "No|Yes", message = "Invalid Solar Diffusing")
        String Solar_Diffusing,
        @DecimalMin(value = "0.0", inclusive = false, message = "Young's modulus must be greater than 0.0")
        Double Youngs_modulus,
        @DecimalMin(value = "0.0", inclusive = false, message = "Poisson's ratio must be greater than 0.0")
        @DecimalMax(value = "1.0", inclusive = false, message = "Poisson's ratio must be less than 1.0")
        Double Poissons_ratio,
        String Window_Glass_Spectral_and_Incident_Angle_Transmittance_Data_Set_Table_Name,
        String Window_Glass_Spectral_and_Incident_Angle_Front_Reflectance_Data_Set_Table_Name,
        String Window_Glass_Spectral_and_Incident_Angle_Back_Reflectance_Data_Set_Table_Name
) implements IdfObjectRecord {}
