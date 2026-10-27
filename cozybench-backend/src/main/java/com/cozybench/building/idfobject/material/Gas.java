package com.cozybench.building.idfobject.material;

import com.cozybench.building.model.validation.IddPropertiesRecord;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;

/** Schema and creation defaults for EnergyPlus {@code WindowMaterial:Gas}. */
@Builder
public record Gas(
        @NotBlank String Name,
        @NotBlank @Pattern(regexp = "Air|Argon|Krypton|Xenon|Custom") String Gas_Type,
        @NotNull @DecimalMin(value = "0", inclusive = false) Double Thickness,
        Double Conductivity_Coefficient_A,
        Double Conductivity_Coefficient_B,
        Double Conductivity_Coefficient_C,
        @DecimalMin(value = "0", inclusive = false) Double Viscosity_Coefficient_A,
        Double Viscosity_Coefficient_B,
        Double Viscosity_Coefficient_C,
        @DecimalMin(value = "0", inclusive = false) Double Specific_Heat_Coefficient_A,
        Double Specific_Heat_Coefficient_B,
        Double Specific_Heat_Coefficient_C,
        @DecimalMin("20") @DecimalMax("200") Double Molecular_Weight,
        @DecimalMin(value = "1", inclusive = false) Double Specific_Heat_Ratio
) implements IddPropertiesRecord {
    // Apply defaults here so omitted values behave the same for builders and API submissions.
    public Gas {
        Gas_Type = Gas_Type == null ? "Air" : Gas_Type;
        Thickness = Thickness == null ? 0.0127 : Thickness;
    }

    @AssertTrue(message = "Custom gas requires every gas coefficient")
    public boolean hasCompleteCustomGasData() {
        return !"Custom".equals(Gas_Type)
                || Conductivity_Coefficient_A != null && Conductivity_Coefficient_B != null
                && Conductivity_Coefficient_C != null && Viscosity_Coefficient_A != null
                && Viscosity_Coefficient_B != null && Viscosity_Coefficient_C != null
                && Specific_Heat_Coefficient_A != null && Specific_Heat_Coefficient_B != null
                && Specific_Heat_Coefficient_C != null && Molecular_Weight != null
                && Specific_Heat_Ratio != null;
    }
}
