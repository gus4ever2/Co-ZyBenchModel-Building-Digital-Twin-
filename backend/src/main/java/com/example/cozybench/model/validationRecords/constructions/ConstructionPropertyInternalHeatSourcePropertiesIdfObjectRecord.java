package com.example.cozybench.model.validationRecords.constructions;

import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import jakarta.validation.constraints.*;
import lombok.Builder;


@Builder
public record ConstructionPropertyInternalHeatSourcePropertiesIdfObjectRecord(
        @NotBlank(message = "Name is required")
        String Name,

        String Construction_Name,

        @NotNull(message = "Thermal Source Present After Layer Number is required")
        @Min(value = 1, message = "Thermal Source Present After Layer Number must be at least 1")
        Integer Thermal_Source_Present_After_Layer_Number,

        @NotNull(message = "Temperature Calculation Requested After Layer Number is required")
        Integer Temperature_Calculation_Requested_After_Layer_Number,

        @NotNull(message = "Dimensions for the CTF Calculation is required")
        @Min(value = 1, message = "Dimensions for the CTF Calculation must be at least 1")
        @Max(value = 2, message = "Dimensions for the CTF Calculation must be at most 2")
        Integer Dimensions_for_the_CTF_Calculation,

        @NotNull(message = "Tube Spacing is required")
        @DecimalMin(value = "0.01", message = "Tube Spacing must be at least 0.01")
        @DecimalMax(value = "1.0", message = "Tube Spacing must be at most 1.0")
        Double Tube_Spacing,

        @NotNull(message = "Two-Dimensional Temperature Calculation Position is required")
        @DecimalMin(value = "0.0", message = "Two-Dimensional Temperature Calculation Position must be at least 0.0")
        @DecimalMax(value = "1.0", message = "Two-Dimensional Temperature Calculation Position must be at most 1.0")
        Double Two_Dimensional_Temperature_Calculation_Position
) implements IdfObjectRecord {}
