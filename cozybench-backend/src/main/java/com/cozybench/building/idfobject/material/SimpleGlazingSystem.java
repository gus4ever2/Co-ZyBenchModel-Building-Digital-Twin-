package com.cozybench.building.idfobject.material;

import com.cozybench.building.model.validation.IddPropertiesRecord;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

/** Schema and defaults for EnergyPlus {@code WindowMaterial:SimpleGlazingSystem}. */
@Builder
public record SimpleGlazingSystem(
        @NotBlank String Name,
        @NotNull @DecimalMin(value = "0", inclusive = false) Double U_Factor,
        @NotNull @DecimalMin(value = "0", inclusive = false)
        @DecimalMax(value = "1", inclusive = false) Double Solar_Heat_Gain_Coefficient,
        @DecimalMin(value = "0", inclusive = false)
        @DecimalMax(value = "1", inclusive = false) Double Visible_Transmittance
) implements IddPropertiesRecord {

    // Omitted builder fields use the same initial values as a newly created editor item.
    public SimpleGlazingSystem {
        U_Factor = U_Factor == null ? 2.7 : U_Factor;
        Solar_Heat_Gain_Coefficient = Solar_Heat_Gain_Coefficient == null
                ? 0.4 : Solar_Heat_Gain_Coefficient;
        Visible_Transmittance = Visible_Transmittance == null ? 0.6 : Visible_Transmittance;
    }
}
