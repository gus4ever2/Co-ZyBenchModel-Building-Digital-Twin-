package com.cozybench.building.idfobject.material;

import com.cozybench.building.model.validation.IddPropertiesRecord;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;

/** Schema and defaults for EnergyPlus {@code WindowMaterial:Glazing}. */
@Builder
public record Glazing(
        @NotBlank String Name,
        @NotBlank @Pattern(regexp = "SpectralAverage|Spectral|BSDF|SpectralAndAngle") String Optical_Data_Type,
        String Window_Glass_Spectral_Data_Set_Name,
        @NotNull @DecimalMin(value = "0", inclusive = false) Double Thickness,
        @DecimalMin("0") @DecimalMax("1") Double Solar_Transmittance_at_Normal_Incidence,
        @DecimalMin("0") @DecimalMax("1") Double Front_Side_Solar_Reflectance_at_Normal_Incidence,
        @DecimalMin("0") @DecimalMax("1") Double Back_Side_Solar_Reflectance_at_Normal_Incidence,
        @DecimalMin("0") @DecimalMax("1") Double Visible_Transmittance_at_Normal_Incidence,
        @DecimalMin("0") @DecimalMax("1") Double Front_Side_Visible_Reflectance_at_Normal_Incidence,
        @DecimalMin("0") @DecimalMax("1") Double Back_Side_Visible_Reflectance_at_Normal_Incidence,
        @DecimalMin("0") @DecimalMax("1") Double Infrared_Transmittance_at_Normal_Incidence,
        @DecimalMin(value = "0", inclusive = false) @DecimalMax(value = "1", inclusive = false)
        Double Front_Side_Infrared_Hemispherical_Emissivity,
        @DecimalMin(value = "0", inclusive = false) @DecimalMax(value = "1", inclusive = false)
        Double Back_Side_Infrared_Hemispherical_Emissivity,
        @DecimalMin(value = "0", inclusive = false) Double Conductivity,
        @DecimalMin(value = "0", inclusive = false) @DecimalMax("1")
        Double Dirt_Correction_Factor_for_Solar_and_Visible_Transmittance,
        @Pattern(regexp = "No|Yes") String Solar_Diffusing,
        @DecimalMin(value = "0", inclusive = false) Double Youngs_modulus,
        @DecimalMin(value = "0", inclusive = false) @DecimalMax(value = "1", inclusive = false)
        Double Poissons_ratio,
        String Window_Glass_Spectral_and_Incident_Angle_Transmittance_Data_Set_Table_Name,
        String Window_Glass_Spectral_and_Incident_Angle_Front_Reflectance_Data_Set_Table_Name,
        String Window_Glass_Spectral_and_Incident_Angle_Back_Reflectance_Data_Set_Table_Name
) implements IddPropertiesRecord {
    // Null means the builder or API omitted this field; apply the editor's initial values.
    public Glazing {
        Optical_Data_Type = Optical_Data_Type == null ? "SpectralAverage" : Optical_Data_Type;
        Thickness = Thickness == null ? 0.003 : Thickness;
        Infrared_Transmittance_at_Normal_Incidence = Infrared_Transmittance_at_Normal_Incidence == null
                ? 0.0 : Infrared_Transmittance_at_Normal_Incidence;
        Front_Side_Infrared_Hemispherical_Emissivity =
                Front_Side_Infrared_Hemispherical_Emissivity == null
                        ? 0.84 : Front_Side_Infrared_Hemispherical_Emissivity;
        Back_Side_Infrared_Hemispherical_Emissivity =
                Back_Side_Infrared_Hemispherical_Emissivity == null
                        ? 0.84 : Back_Side_Infrared_Hemispherical_Emissivity;
        Conductivity = Conductivity == null ? 0.9 : Conductivity;
        Dirt_Correction_Factor_for_Solar_and_Visible_Transmittance =
                Dirt_Correction_Factor_for_Solar_and_Visible_Transmittance == null
                        ? 1.0 : Dirt_Correction_Factor_for_Solar_and_Visible_Transmittance;
        Solar_Diffusing = Solar_Diffusing == null ? "No" : Solar_Diffusing;
        Youngs_modulus = Youngs_modulus == null ? 72000000000.0 : Youngs_modulus;
        Poissons_ratio = Poissons_ratio == null ? 0.22 : Poissons_ratio;
    }
}
