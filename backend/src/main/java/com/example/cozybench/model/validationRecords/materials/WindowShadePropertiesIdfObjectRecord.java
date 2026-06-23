package com.example.cozybench.model.validationRecords.materials;

import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import lombok.Builder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;

@Builder
public record WindowShadePropertiesIdfObjectRecord(
        @NotBlank(message = "Name is required")
        String Name,
        @NotNull(message = "Solar Transmittance is required")
        @DecimalMin(value = "0", message = "Solar Transmittance must be at least 0")
        @DecimalMax(value = "1", inclusive = false, message = "Solar Transmittance must be less than 1")
        Double Solar_Transmittance,
        @NotNull(message = "Solar Reflectance is required")
        @DecimalMin(value = "0", message = "Solar Reflectance must be at least 0")
        @DecimalMax(value = "1", inclusive = false, message = "Solar Reflectance must be less than 1")
        Double Solar_Reflectance,
        @NotNull(message = "Visible Transmittance is required")
        @DecimalMin(value = "0", message = "Visible Transmittance must be at least 0")
        @DecimalMax(value = "1", inclusive = false, message = "Visible Transmittance must be less than 1")
        Double Visible_Transmittance,
        @NotNull(message = "Visible Reflectance is required")
        @DecimalMin(value = "0", message = "Visible Reflectance must be at least 0")
        @DecimalMax(value = "1", inclusive = false, message = "Visible Reflectance must be less than 1")
        Double Visible_Reflectance,
        @NotNull(message = "Infrared Hemispherical Emissivity is required")
        @DecimalMin(value = "0", inclusive = false, message = "Infrared Hemispherical Emissivity must be greater than 0")
        @DecimalMax(value = "1", inclusive = false, message = "Infrared Hemispherical Emissivity must be less than 1")
        Double Infrared_Hemispherical_Emissivity,
        @NotNull(message = "Infrared Transmittance is required")
        @DecimalMin(value = "0", message = "Infrared Transmittance must be at least 0")
        @DecimalMax(value = "1", inclusive = false, message = "Infrared Transmittance must be less than 1")
        Double Infrared_Transmittance,
        @NotNull(message = "Thickness is required")
        @DecimalMin(value = "0", inclusive = false, message = "Thickness must be greater than 0")
        Double Thickness,
        @NotNull(message = "Conductivity is required")
        @DecimalMin(value = "0", inclusive = false, message = "Conductivity must be greater than 0")
        Double Conductivity,
        @DecimalMin(value = "0.001", message = "Shade to Glass Distance must be at least 0.001")
        @DecimalMax(value = "1.0", message = "Shade to Glass Distance must be at most 1.0")
        Double Shade_to_Glass_Distance,
        @DecimalMin(value = "0.0", message = "Top Opening Multiplier must be at least 0.0")
        @DecimalMax(value = "1.0", message = "Top Opening Multiplier must be at most 1.0")
        Double Top_Opening_Multiplier,
        @DecimalMin(value = "0.0", message = "Bottom Opening Multiplier must be at least 0.0")
        @DecimalMax(value = "1.0", message = "Bottom Opening Multiplier must be at most 1.0")
        Double Bottom_Opening_Multiplier,
        @DecimalMin(value = "0.0", message = "Left-Side Opening Multiplier must be at least 0.0")
        @DecimalMax(value = "1.0", message = "Left-Side Opening Multiplier must be at most 1.0")
        Double Left_Side_Opening_Multiplier,
        @DecimalMin(value = "0.0", message = "Right-Side Opening Multiplier must be at least 0.0")
        @DecimalMax(value = "1.0", message = "Right-Side Opening Multiplier must be at most 1.0")
        Double Right_Side_Opening_Multiplier,
        @DecimalMin(value = "0.0", message = "Airflow Permeability must be at least 0.0")
        @DecimalMax(value = "0.8", message = "Airflow Permeability must be at most 0.8")
        Double Airflow_Permeability
) implements IdfObjectRecord {}
