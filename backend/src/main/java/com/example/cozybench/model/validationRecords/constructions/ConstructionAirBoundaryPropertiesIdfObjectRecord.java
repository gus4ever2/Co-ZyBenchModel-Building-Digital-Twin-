package com.example.cozybench.model.validationRecords.constructions;

import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import jakarta.validation.constraints.*;
import lombok.Builder;


@Builder
public record ConstructionAirBoundaryPropertiesIdfObjectRecord(
        @NotBlank(message = "Name is required")
        String Name,

        @Pattern(regexp = "None|SimpleMixing", message = "Invalid Air Exchange Method")
        String Air_Exchange_Method,

        @DecimalMin(value = "0.0", message = "Simple Mixing Air Changes per Hour must be at least 0")
        Double Simple_Mixing_Air_Changes_per_Hour,

        String Simple_Mixing_Schedule_Name
) implements IdfObjectRecord {}
