package com.cozybench.building.idfobject.construction;

import com.cozybench.building.model.validation.IddPropertiesRecord;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

/** Properties of EnergyPlus {@code ConstructionProperty:InternalHeatSource}. */
@Builder
public record InternalHeatSource(
        @NotBlank String Name, @NotBlank String Construction_Name,
        @NotNull @Min(1) Integer Thermal_Source_Present_After_Layer_Number,
        @NotNull @Min(0) Integer Temperature_Calculation_Requested_After_Layer_Number,
        @NotNull @Min(1) @Max(2) Integer Dimensions_for_the_CTF_Calculation,
        @NotNull @DecimalMin("0.01") @DecimalMax("1") Double Tube_Spacing,
        @DecimalMin("0") @DecimalMax("1") Double Two_Dimensional_Temperature_Calculation_Position
) implements IddPropertiesRecord {
    // Defaults here apply consistently to both Lombok builders and reflective creation.
    public InternalHeatSource {
        Thermal_Source_Present_After_Layer_Number =
                Thermal_Source_Present_After_Layer_Number == null
                        ? 1 : Thermal_Source_Present_After_Layer_Number;
        Temperature_Calculation_Requested_After_Layer_Number =
                Temperature_Calculation_Requested_After_Layer_Number == null
                        ? 1 : Temperature_Calculation_Requested_After_Layer_Number;
        Dimensions_for_the_CTF_Calculation = Dimensions_for_the_CTF_Calculation == null
                ? 1 : Dimensions_for_the_CTF_Calculation;
        Tube_Spacing = Tube_Spacing == null ? 0.15 : Tube_Spacing;
        Two_Dimensional_Temperature_Calculation_Position =
                Two_Dimensional_Temperature_Calculation_Position == null
                        ? 0.0 : Two_Dimensional_Temperature_Calculation_Position;
    }
}
