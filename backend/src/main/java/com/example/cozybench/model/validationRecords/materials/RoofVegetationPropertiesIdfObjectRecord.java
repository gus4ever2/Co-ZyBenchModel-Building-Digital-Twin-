package com.example.cozybench.model.validationRecords.materials;

import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import lombok.Builder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Pattern;

@Builder
public record RoofVegetationPropertiesIdfObjectRecord(
        @NotBlank(message = "Name is required")
        String Name,
        @DecimalMin(value = "0.005", inclusive = false, message = "Height of Plants must be greater than 0.005")
        @DecimalMax(value = "1.0", message = "Height of Plants must be at most 1.0")
        Double Height_of_Plants,
        @DecimalMin(value = "0.001", inclusive = false, message = "Leaf Area Index must be greater than 0.001")
        @DecimalMax(value = "5.0", message = "Leaf Area Index must be at most 5.0")
        Double Leaf_Area_Index,
        @DecimalMin(value = "0.05", message = "Leaf Reflectivity must be at least 0.05")
        @DecimalMax(value = "0.5", message = "Leaf Reflectivity must be at most 0.5")
        Double Leaf_Reflectivity,
        @DecimalMin(value = "0.8", message = "Leaf Emissivity must be at least 0.8")
        @DecimalMax(value = "1.0", message = "Leaf Emissivity must be at most 1.0")
        Double Leaf_Emissivity,
        @DecimalMin(value = "50.0", message = "Minimum Stomatal Resistance must be at least 50.0")
        @DecimalMax(value = "300.", message = "Minimum Stomatal Resistance must be at most 300.")
        Double Minimum_Stomatal_Resistance,
        String Soil_Layer_Name,
        @Pattern(regexp = "VeryRough|MediumRough|Rough|Smooth|MediumSmooth|VerySmooth", message = "Invalid Roughness")
        String Roughness,
        @DecimalMin(value = "0.05", inclusive = false, message = "Thickness must be greater than 0.05")
        @DecimalMax(value = "0.7", message = "Thickness must be at most 0.7")
        Double Thickness,
        @DecimalMin(value = "0.2", message = "Conductivity of Dry Soil must be at least 0.2")
        @DecimalMax(value = "1.5", message = "Conductivity of Dry Soil must be at most 1.5")
        Double Conductivity_of_Dry_Soil,
        @DecimalMin(value = "300", message = "Density of Dry Soil must be at least 300")
        @DecimalMax(value = "2000", message = "Density of Dry Soil must be at most 2000")
        Double Density_of_Dry_Soil,
        @DecimalMin(value = "500", inclusive = false, message = "Specific Heat of Dry Soil must be greater than 500")
        @DecimalMax(value = "2000", message = "Specific Heat of Dry Soil must be at most 2000")
        Double Specific_Heat_of_Dry_Soil,
        @DecimalMin(value = "0.8", inclusive = false, message = "Thermal Absorptance must be greater than 0.8")
        @DecimalMax(value = "1.0", message = "Thermal Absorptance must be at most 1.0")
        Double Thermal_Absorptance,
        @DecimalMin(value = "0.40", message = "Solar Absorptance must be at least 0.40")
        @DecimalMax(value = "0.9", message = "Solar Absorptance must be at most 0.9")
        Double Solar_Absorptance,
        @DecimalMin(value = "0.5", inclusive = false, message = "Visible Absorptance must be greater than 0.5")
        @DecimalMax(value = "1.0", message = "Visible Absorptance must be at most 1.0")
        Double Visible_Absorptance,
        @DecimalMin(value = "0.1", inclusive = false, message = "Saturation Volumetric Moisture Content of the Soil Layer must be greater than 0.1")
        @DecimalMax(value = "0.5", message = "Saturation Volumetric Moisture Content of the Soil Layer must be at most 0.5")
        Double Saturation_Volumetric_Moisture_Content_of_the_Soil_Layer,
        @DecimalMin(value = "0.01", message = "Residual Volumetric Moisture Content of the Soil Layer must be at least 0.01")
        @DecimalMax(value = "0.1", message = "Residual Volumetric Moisture Content of the Soil Layer must be at most 0.1")
        Double Residual_Volumetric_Moisture_Content_of_the_Soil_Layer,
        @DecimalMin(value = "0.05", inclusive = false, message = "Initial Volumetric Moisture Content of the Soil Layer must be greater than 0.05")
        @DecimalMax(value = "0.5", message = "Initial Volumetric Moisture Content of the Soil Layer must be at most 0.5")
        Double Initial_Volumetric_Moisture_Content_of_the_Soil_Layer,
        @Pattern(regexp = "Simple|Advanced", message = "Invalid Moisture Diffusion Calculation Method")
        String Moisture_Diffusion_Calculation_Method
) implements IdfObjectRecord {}
