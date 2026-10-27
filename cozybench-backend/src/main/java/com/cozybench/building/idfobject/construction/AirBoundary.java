package com.cozybench.building.idfobject.construction;

import com.cozybench.building.model.validation.IddPropertiesRecord;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;

/** Properties of EnergyPlus {@code Construction:AirBoundary}. */
@Builder
public record AirBoundary(
        @NotBlank String Name,
        @Pattern(regexp = "None|SimpleMixing") String Air_Exchange_Method,
        @DecimalMin("0") Double Simple_Mixing_Air_Changes_per_Hour,
        String Simple_Mixing_Schedule_Name
) implements IddPropertiesRecord {
    // Preserve the form defaults for builder-created and reflectively created records.
    public AirBoundary {
        Air_Exchange_Method = Air_Exchange_Method == null ? "None" : Air_Exchange_Method;
        Simple_Mixing_Air_Changes_per_Hour = Simple_Mixing_Air_Changes_per_Hour == null
                ? 0.5 : Simple_Mixing_Air_Changes_per_Hour;
    }
}
