package com.cozybench.building.idfobject.material;

import com.cozybench.building.model.validation.IddPropertiesRecord;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

/** Schema for EnergyPlus {@code Material:InfraredTransparent}; it has no default properties. */
@Builder
public record InfraredTransparent(
        @NotBlank String Name
) implements IddPropertiesRecord {
}
