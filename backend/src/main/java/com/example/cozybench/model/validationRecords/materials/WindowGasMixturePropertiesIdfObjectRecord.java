package com.example.cozybench.model.validationRecords.materials;

import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import lombok.Builder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Pattern;

@Builder
public record WindowGasMixturePropertiesIdfObjectRecord(
        @NotBlank(message = "Name is required")
        String Name,
        @NotNull(message = "Thickness is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Thickness must be greater than 0.0")
        Double Thickness,
        @NotNull(message = "Number of Gases in Mixture is required")
        @DecimalMin(value = "1", message = "Number of Gases in Mixture must be at least 1")
        @DecimalMax(value = "4", message = "Number of Gases in Mixture must be at most 4")
        Double Number_of_Gases_in_Mixture,
        @NotBlank(message = "Gas 1 Type is required")
        @Pattern(regexp = "Air|Argon|Krypton|Xenon", message = "Invalid Gas 1 Type")
        String Gas_1_Type,
        @NotNull(message = "Gas 1 Fraction is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Gas 1 Fraction must be greater than 0.0")
        @DecimalMax(value = "1.0", message = "Gas 1 Fraction must be at most 1.0")
        Double Gas_1_Fraction,
        @NotBlank(message = "Gas 2 Type is required")
        @Pattern(regexp = "Air|Argon|Krypton|Xenon", message = "Invalid Gas 2 Type")
        String Gas_2_Type,
        @NotNull(message = "Gas 2 Fraction is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Gas 2 Fraction must be greater than 0.0")
        @DecimalMax(value = "1.0", message = "Gas 2 Fraction must be at most 1.0")
        Double Gas_2_Fraction,
        @Pattern(regexp = "Air|Argon|Krypton|Xenon", message = "Invalid Gas 3 Type")
        String Gas_3_Type,
        @DecimalMin(value = "0.0", inclusive = false, message = "Gas 3 Fraction must be greater than 0.0")
        @DecimalMax(value = "1.0", message = "Gas 3 Fraction must be at most 1.0")
        Double Gas_3_Fraction,
        @Pattern(regexp = "Air|Argon|Krypton|Xenon", message = "Invalid Gas 4 Type")
        String Gas_4_Type,
        @DecimalMin(value = "0.0", inclusive = false, message = "Gas 4 Fraction must be greater than 0.0")
        @DecimalMax(value = "1.0", message = "Gas 4 Fraction must be at most 1.0")
        Double Gas_4_Fraction
) implements IdfObjectRecord {}
