package com.cozybench.building.idfobject.material;

import com.cozybench.building.model.validation.IddPropertiesRecord;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;

/** Schema and creation defaults for EnergyPlus {@code Material}. */
@Builder
public record Material(
        @NotBlank String Name,
        @NotBlank @Pattern(regexp = "VeryRough|Rough|MediumRough|MediumSmooth|Smooth|VerySmooth") String Roughness,
        @NotNull @DecimalMin(value = "0", inclusive = false) Double Thickness,
        @NotNull @DecimalMin(value = "0", inclusive = false) Double Conductivity,
        @NotNull @DecimalMin(value = "0", inclusive = false) Double Density,
        @NotNull @DecimalMin("100") Double Specific_Heat,
        @DecimalMin(value = "0", inclusive = false) @DecimalMax("0.99999") Double Thermal_Absorptance,
        @DecimalMin("0") @DecimalMax("1") Double Solar_Absorptance,
        @DecimalMin("0") @DecimalMax("1") Double Visible_Absorptance
) implements IddPropertiesRecord {
    // Lombok's builder calls this constructor; omitted fields receive editor defaults here.
    public Material {
        Roughness = Roughness == null ? "MediumRough" : Roughness;
        Thickness = Thickness == null ? 0.1 : Thickness;
        Conductivity = Conductivity == null ? 0.1 : Conductivity;
        Density = Density == null ? 1000.0 : Density;
        Specific_Heat = Specific_Heat == null ? 1000.0 : Specific_Heat;
        Thermal_Absorptance = Thermal_Absorptance == null ? 0.9 : Thermal_Absorptance;
        Solar_Absorptance = Solar_Absorptance == null ? 0.7 : Solar_Absorptance;
        Visible_Absorptance = Visible_Absorptance == null ? 0.7 : Visible_Absorptance;
    }
}
