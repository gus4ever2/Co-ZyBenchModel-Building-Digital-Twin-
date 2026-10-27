package com.cozybench.building.idfobject.material;

import com.cozybench.building.model.validation.IddPropertiesRecord;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;

/** Schema and defaults for EnergyPlus {@code WindowMaterial:Glazing:RefractionExtinctionMethod}. */
@Builder
public record GlazingRefractionExtinctionMethod(
        @NotBlank String Name,
        @NotNull @DecimalMin(value = "0", inclusive = false) Double Thickness,
        @NotNull @DecimalMin(value = "1", inclusive = false) Double Solar_Index_of_Refraction,
        @NotNull @DecimalMin(value = "0", inclusive = false) Double Solar_Extinction_Coefficient,
        @NotNull @DecimalMin(value = "1", inclusive = false) Double Visible_Index_of_Refraction,
        @NotNull @DecimalMin(value = "0", inclusive = false) Double Visible_Extinction_Coefficient,
        @DecimalMin("0") @DecimalMax("1") Double Infrared_Transmittance_at_Normal_Incidence,
        @DecimalMin(value = "0", inclusive = false) @DecimalMax(value = "1", inclusive = false)
        Double Infrared_Hemispherical_Emissivity,
        @DecimalMin(value = "0", inclusive = false) Double Conductivity,
        @DecimalMin(value = "0", inclusive = false) @DecimalMax("1")
        Double Dirt_Correction_Factor_for_Solar_and_Visible_Transmittance,
        @Pattern(regexp = "No|Yes") String Solar_Diffusing
) implements IddPropertiesRecord {
    // The canonical constructor is shared by direct construction, Lombok's builder, and reflection.
    public GlazingRefractionExtinctionMethod {
        Thickness = Thickness == null ? 0.003 : Thickness;
        Solar_Index_of_Refraction = Solar_Index_of_Refraction == null ? 1.5 : Solar_Index_of_Refraction;
        Solar_Extinction_Coefficient = Solar_Extinction_Coefficient == null ? 1.0 : Solar_Extinction_Coefficient;
        Visible_Index_of_Refraction = Visible_Index_of_Refraction == null ? 1.5 : Visible_Index_of_Refraction;
        Visible_Extinction_Coefficient = Visible_Extinction_Coefficient == null
                ? 1.0 : Visible_Extinction_Coefficient;
        Infrared_Transmittance_at_Normal_Incidence = Infrared_Transmittance_at_Normal_Incidence == null
                ? 0.0 : Infrared_Transmittance_at_Normal_Incidence;
        Infrared_Hemispherical_Emissivity = Infrared_Hemispherical_Emissivity == null
                ? 0.84 : Infrared_Hemispherical_Emissivity;
        Conductivity = Conductivity == null ? 0.9 : Conductivity;
        Dirt_Correction_Factor_for_Solar_and_Visible_Transmittance =
                Dirt_Correction_Factor_for_Solar_and_Visible_Transmittance == null
                        ? 1.0 : Dirt_Correction_Factor_for_Solar_and_Visible_Transmittance;
        Solar_Diffusing = Solar_Diffusing == null ? "No" : Solar_Diffusing;
    }
}
