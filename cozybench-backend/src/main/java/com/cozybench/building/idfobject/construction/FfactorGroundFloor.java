package com.cozybench.building.idfobject.construction;

import com.cozybench.building.model.validation.IddPropertiesRecord;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

/** Properties of EnergyPlus {@code Construction:FfactorGroundFloor}. */
@Builder
public record FfactorGroundFloor(
        @NotBlank String Name,
        @NotNull @DecimalMin(value = "0", inclusive = false) Double F_Factor,
        @NotNull @DecimalMin(value = "0", inclusive = false) Double Area,
        @NotNull @DecimalMin("0") Double PerimeterExposed
) implements IddPropertiesRecord {
    // Keep new-record defaults beside the schema that owns those fields.
    public FfactorGroundFloor {
        F_Factor = F_Factor == null ? 1.0 : F_Factor;
        Area = Area == null ? 1.0 : Area;
        PerimeterExposed = PerimeterExposed == null ? 0.0 : PerimeterExposed;
    }
}
