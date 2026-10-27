package com.cozybench.building.idfobject.material;

import com.cozybench.building.model.validation.IddPropertiesRecord;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;
/** Schema and defaults for EnergyPlus {@code WindowMaterial:GasMixture}. */
@Builder
public record GasMixture(
        @NotBlank String Name,
        @NotNull @DecimalMin(value = "0", inclusive = false) Double Thickness,
        @NotNull @Min(1) @Max(4) Integer Number_of_Gases_in_Mixture,
        @NotBlank @Pattern(regexp = "Air|Argon|Krypton|Xenon") String Gas_1_Type,
        @NotNull @DecimalMin(value = "0", inclusive = false) @DecimalMax("1") Double Gas_1_Fraction,
        @NotBlank @Pattern(regexp = "Air|Argon|Krypton|Xenon") String Gas_2_Type,
        @NotNull @DecimalMin(value = "0", inclusive = false) @DecimalMax("1") Double Gas_2_Fraction,
        @Pattern(regexp = "Air|Argon|Krypton|Xenon") String Gas_3_Type,
        @DecimalMin(value = "0", inclusive = false) @DecimalMax("1") Double Gas_3_Fraction,
        @Pattern(regexp = "Air|Argon|Krypton|Xenon") String Gas_4_Type,
        @DecimalMin(value = "0", inclusive = false) @DecimalMax("1") Double Gas_4_Fraction
) implements IddPropertiesRecord {

    // Builder omissions are normalized before the gas-fraction validation runs.
    public GasMixture {
        Thickness = Thickness == null ? 0.0127 : Thickness;
        Number_of_Gases_in_Mixture = Number_of_Gases_in_Mixture == null
                ? 2 : Number_of_Gases_in_Mixture;
        Gas_1_Type = Gas_1_Type == null ? "Air" : Gas_1_Type;
        Gas_1_Fraction = Gas_1_Fraction == null ? 0.5 : Gas_1_Fraction;
        Gas_2_Type = Gas_2_Type == null ? "Argon" : Gas_2_Type;
        Gas_2_Fraction = Gas_2_Fraction == null ? 0.5 : Gas_2_Fraction;
    }

    @AssertTrue(message = "The active gas fractions must add up to 1")
    public boolean hasUnitFractionTotal() {
        if (Number_of_Gases_in_Mixture == null) {
            return false;
        }

        Double[] fractions = {Gas_1_Fraction, Gas_2_Fraction, Gas_3_Fraction, Gas_4_Fraction};
        double total = 0;
        for (int index = 0; index < Number_of_Gases_in_Mixture; index++) {
            if (fractions[index] == null) {
                return false;
            }
            total += fractions[index];
        }
        return Math.abs(total - 1.0) < 1.0e-9;
    }
}
