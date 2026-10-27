package com.cozybench.building.idfobject.construction;

import com.cozybench.building.model.validation.IddPropertiesRecord;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

/** Properties of EnergyPlus {@code Construction:CfactorUndergroundWall}. */
@Builder
public record CfactorUndergroundWall(
        @NotBlank String Name,
        @NotNull @DecimalMin(value = "0", inclusive = false) Double C_Factor,
        @NotNull @DecimalMin(value = "0", inclusive = false) Double Height
) implements IddPropertiesRecord {
    // The IDD fields default here when the builder or API omits them.
    public CfactorUndergroundWall {
        C_Factor = C_Factor == null ? 1.0 : C_Factor;
        Height = Height == null ? 1.0 : Height;
    }
}
