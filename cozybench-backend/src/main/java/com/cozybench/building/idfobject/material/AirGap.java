package com.cozybench.building.idfobject.material;

import com.cozybench.building.model.validation.IddPropertiesRecord;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

/** Schema and defaults for EnergyPlus {@code Material:AirGap}. */
@Builder
public record AirGap(
        @NotBlank String Name,
        @NotNull @DecimalMin(value = "0", inclusive = false) Double Thermal_Resistance
) implements IddPropertiesRecord {

    // The builder and reflective API factory both reach this defaulting constructor.
    public AirGap {
        Thermal_Resistance = Thermal_Resistance == null ? 0.1 : Thermal_Resistance;
    }
}
