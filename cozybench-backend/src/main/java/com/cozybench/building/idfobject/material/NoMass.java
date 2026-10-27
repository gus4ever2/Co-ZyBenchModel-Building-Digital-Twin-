package com.cozybench.building.idfobject.material;

import com.cozybench.building.model.validation.IddPropertiesRecord;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;

/** Schema and defaults for EnergyPlus {@code Material:NoMass}. */
@Builder
public record NoMass(
        @NotBlank String Name,
        @NotBlank @Pattern(regexp = "VeryRough|Rough|MediumRough|MediumSmooth|Smooth|VerySmooth")
        String Roughness,
        @NotNull @DecimalMin("0.001") Double Thermal_Resistance,
        @DecimalMin(value = "0", inclusive = false) @DecimalMax("0.99999") Double Thermal_Absorptance,
        @DecimalMin("0") @DecimalMax("1") Double Solar_Absorptance,
        @DecimalMin("0") @DecimalMax("1") Double Visible_Absorptance
) implements IddPropertiesRecord {

    // Keep builder and API-created records on the same defaults.
    public NoMass {
        Roughness = Roughness == null ? "MediumRough" : Roughness;
        Thermal_Resistance = Thermal_Resistance == null ? 0.1 : Thermal_Resistance;
        Thermal_Absorptance = Thermal_Absorptance == null ? 0.9 : Thermal_Absorptance;
        Solar_Absorptance = Solar_Absorptance == null ? 0.7 : Solar_Absorptance;
        Visible_Absorptance = Visible_Absorptance == null ? 0.7 : Visible_Absorptance;
    }
}
