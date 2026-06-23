package com.example.cozybench.model.validationRecords.constructions;

import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import jakarta.validation.constraints.*;
import lombok.Builder;


@Builder
public record ConstructionFfactorGroundFloorPropertiesIdfObjectRecord(
        @NotBlank(message = "Name is required")
        String Name,

        @NotNull(message = "F-Factor is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "F-Factor must be greater than 0")
        Double F_Factor,

        @NotNull(message = "Area is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Area must be greater than 0")
        Double Area,

        @NotNull(message = "PerimeterExposed is required")
        @DecimalMin(value = "0.0", message = "PerimeterExposed must be at least 0")
        Double Perimeter_Exposed
) implements IdfObjectRecord {}
