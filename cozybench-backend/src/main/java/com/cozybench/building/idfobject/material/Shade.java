package com.cozybench.building.idfobject.material;

import com.cozybench.building.model.validation.IddPropertiesRecord;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

/** Schema and defaults for EnergyPlus {@code WindowMaterial:Shade}. */
@Builder
public record Shade(
        @NotBlank String Name,
        @NotNull @DecimalMin("0") @DecimalMax(value = "1", inclusive = false) Double Solar_Transmittance,
        @NotNull @DecimalMin("0") @DecimalMax(value = "1", inclusive = false) Double Solar_Reflectance,
        @NotNull @DecimalMin("0") @DecimalMax(value = "1", inclusive = false) Double Visible_Transmittance,
        @NotNull @DecimalMin("0") @DecimalMax(value = "1", inclusive = false) Double Visible_Reflectance,
        @NotNull @DecimalMin(value = "0", inclusive = false)
        @DecimalMax(value = "1", inclusive = false) Double Infrared_Hemispherical_Emissivity,
        @NotNull @DecimalMin("0") @DecimalMax(value = "1", inclusive = false) Double Infrared_Transmittance,
        @NotNull @DecimalMin(value = "0", inclusive = false) Double Thickness,
        @NotNull @DecimalMin(value = "0", inclusive = false) Double Conductivity,
        @DecimalMin("0.001") @DecimalMax("1") Double Shade_to_Glass_Distance,
        @DecimalMin("0") @DecimalMax("1") Double Top_Opening_Multiplier,
        @DecimalMin("0") @DecimalMax("1") Double Bottom_Opening_Multiplier,
        @DecimalMin("0") @DecimalMax("1") Double Left_Side_Opening_Multiplier,
        @DecimalMin("0") @DecimalMax("1") Double Right_Side_Opening_Multiplier,
        @DecimalMin("0") @DecimalMax("0.8") Double Airflow_Permeability
) implements IddPropertiesRecord {

    // Keep editor defaults in the record so builders and the reflective factory agree.
    public Shade {
        Solar_Transmittance = Solar_Transmittance == null ? 0.0 : Solar_Transmittance;
        Solar_Reflectance = Solar_Reflectance == null ? 0.5 : Solar_Reflectance;
        Visible_Transmittance = Visible_Transmittance == null ? 0.0 : Visible_Transmittance;
        Visible_Reflectance = Visible_Reflectance == null ? 0.5 : Visible_Reflectance;
        Infrared_Hemispherical_Emissivity = Infrared_Hemispherical_Emissivity == null
                ? 0.9 : Infrared_Hemispherical_Emissivity;
        Infrared_Transmittance = Infrared_Transmittance == null ? 0.0 : Infrared_Transmittance;
        Thickness = Thickness == null ? 0.001 : Thickness;
        Conductivity = Conductivity == null ? 0.1 : Conductivity;
        Shade_to_Glass_Distance = Shade_to_Glass_Distance == null ? 0.05 : Shade_to_Glass_Distance;
        Top_Opening_Multiplier = Top_Opening_Multiplier == null ? 0.5 : Top_Opening_Multiplier;
        Bottom_Opening_Multiplier = Bottom_Opening_Multiplier == null ? 0.5 : Bottom_Opening_Multiplier;
        Left_Side_Opening_Multiplier = Left_Side_Opening_Multiplier == null
                ? 0.5 : Left_Side_Opening_Multiplier;
        Right_Side_Opening_Multiplier = Right_Side_Opening_Multiplier == null
                ? 0.5 : Right_Side_Opening_Multiplier;
        Airflow_Permeability = Airflow_Permeability == null ? 0.0 : Airflow_Permeability;
    }
}
