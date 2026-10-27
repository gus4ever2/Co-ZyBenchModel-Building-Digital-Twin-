package com.cozybench.building.idfobject.construction;

import com.cozybench.building.model.validation.IddPropertiesRecord;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

/** Properties of EnergyPlus {@code Construction}; layers reference materials by workspace ID. */
@Builder
public record LayeredConstruction(
        @NotBlank String Name, @NotBlank String Outside_Layer,
        String Layer_2, String Layer_3, String Layer_4, String Layer_5, String Layer_6,
        String Layer_7, String Layer_8, String Layer_9, String Layer_10
) implements IddPropertiesRecord {
}
