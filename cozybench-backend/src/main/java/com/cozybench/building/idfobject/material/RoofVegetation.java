package com.cozybench.building.idfobject.material;

import com.cozybench.building.model.validation.IddPropertiesRecord;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;

/** Schema and defaults for EnergyPlus {@code Material:RoofVegetation}. */
@Builder
public record RoofVegetation(
        @NotBlank String Name,
        @DecimalMin(value = "0.005", inclusive = false) @DecimalMax("1.0") Double Height_of_Plants,
        @DecimalMin(value = "0.001", inclusive = false) @DecimalMax("5.0") Double Leaf_Area_Index,
        @DecimalMin("0.05") @DecimalMax("0.5") Double Leaf_Reflectivity,
        @DecimalMin("0.8") @DecimalMax("1.0") Double Leaf_Emissivity,
        @DecimalMin("50.0") @DecimalMax("300.0") Double Minimum_Stomatal_Resistance,
        String Soil_Layer_Name,
        @Pattern(regexp = "VeryRough|Rough|MediumRough|MediumSmooth|Smooth|VerySmooth") String Roughness,
        @DecimalMin(value = "0.05", inclusive = false) @DecimalMax("0.7") Double Thickness,
        @DecimalMin("0.2") @DecimalMax("1.5") Double Conductivity_of_Dry_Soil,
        @DecimalMin("300") @DecimalMax("2000") Double Density_of_Dry_Soil,
        @DecimalMin(value = "500", inclusive = false) @DecimalMax("2000") Double Specific_Heat_of_Dry_Soil,
        @DecimalMin(value = "0.8", inclusive = false) @DecimalMax("1.0") Double Thermal_Absorptance,
        @DecimalMin("0.40") @DecimalMax("0.9") Double Solar_Absorptance,
        @DecimalMin(value = "0.5", inclusive = false) @DecimalMax("1.0") Double Visible_Absorptance,
        @DecimalMin(value = "0.1", inclusive = false) @DecimalMax("0.5")
        Double Saturation_Volumetric_Moisture_Content_of_the_Soil_Layer,
        @DecimalMin("0.01") @DecimalMax("0.1") Double Residual_Volumetric_Moisture_Content_of_the_Soil_Layer,
        @DecimalMin(value = "0.05", inclusive = false) @DecimalMax("0.5")
        Double Initial_Volumetric_Moisture_Content_of_the_Soil_Layer,
        @Pattern(regexp = "Simple|Advanced") String Moisture_Diffusion_Calculation_Method
) implements IddPropertiesRecord {
    // Centralize creation defaults so builder and reflective factory behavior stays identical.
    public RoofVegetation {
        Height_of_Plants = Height_of_Plants == null ? 0.2 : Height_of_Plants;
        Leaf_Area_Index = Leaf_Area_Index == null ? 1.0 : Leaf_Area_Index;
        Leaf_Reflectivity = Leaf_Reflectivity == null ? 0.22 : Leaf_Reflectivity;
        Leaf_Emissivity = Leaf_Emissivity == null ? 0.95 : Leaf_Emissivity;
        Minimum_Stomatal_Resistance = Minimum_Stomatal_Resistance == null
                ? 180.0 : Minimum_Stomatal_Resistance;
        Soil_Layer_Name = Soil_Layer_Name == null ? "Green Roof Soil" : Soil_Layer_Name;
        Roughness = Roughness == null ? "MediumRough" : Roughness;
        Thickness = Thickness == null ? 0.1 : Thickness;
        Conductivity_of_Dry_Soil = Conductivity_of_Dry_Soil == null ? 0.35 : Conductivity_of_Dry_Soil;
        Density_of_Dry_Soil = Density_of_Dry_Soil == null ? 1100.0 : Density_of_Dry_Soil;
        Specific_Heat_of_Dry_Soil = Specific_Heat_of_Dry_Soil == null
                ? 1200.0 : Specific_Heat_of_Dry_Soil;
        Thermal_Absorptance = Thermal_Absorptance == null ? 0.9 : Thermal_Absorptance;
        Solar_Absorptance = Solar_Absorptance == null ? 0.7 : Solar_Absorptance;
        Visible_Absorptance = Visible_Absorptance == null ? 0.75 : Visible_Absorptance;
        Saturation_Volumetric_Moisture_Content_of_the_Soil_Layer =
                Saturation_Volumetric_Moisture_Content_of_the_Soil_Layer == null
                        ? 0.3 : Saturation_Volumetric_Moisture_Content_of_the_Soil_Layer;
        Residual_Volumetric_Moisture_Content_of_the_Soil_Layer =
                Residual_Volumetric_Moisture_Content_of_the_Soil_Layer == null
                        ? 0.01 : Residual_Volumetric_Moisture_Content_of_the_Soil_Layer;
        Initial_Volumetric_Moisture_Content_of_the_Soil_Layer =
                Initial_Volumetric_Moisture_Content_of_the_Soil_Layer == null
                        ? 0.1 : Initial_Volumetric_Moisture_Content_of_the_Soil_Layer;
        Moisture_Diffusion_Calculation_Method = Moisture_Diffusion_Calculation_Method == null
                ? "Advanced" : Moisture_Diffusion_Calculation_Method;
    }
}
