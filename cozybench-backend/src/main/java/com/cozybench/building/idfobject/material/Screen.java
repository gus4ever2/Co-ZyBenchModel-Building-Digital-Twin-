package com.cozybench.building.idfobject.material;

import com.cozybench.building.model.validation.IddPropertiesRecord;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;

/** Schema and defaults for EnergyPlus {@code WindowMaterial:Screen}. */
@Builder
public record Screen(
        @NotBlank String Name,
        @Pattern(regexp = "DoNotModel|ModelAsDirectBeam|ModelAsDiffuse")
        String Reflected_Beam_Transmittance_Accounting_Method,
        @NotNull @DecimalMin("0") @DecimalMax(value = "1", inclusive = false) Double Diffuse_Solar_Reflectance,
        @NotNull @DecimalMin("0") @DecimalMax(value = "1", inclusive = false) Double Diffuse_Visible_Reflectance,
        @DecimalMin(value = "0", inclusive = false) @DecimalMax(value = "1", inclusive = false)
        Double Thermal_Hemispherical_Emissivity,
        @DecimalMin(value = "0", inclusive = false) Double Conductivity,
        @NotNull @DecimalMin(value = "0", inclusive = false) Double Screen_Material_Spacing,
        @NotNull @DecimalMin(value = "0", inclusive = false) Double Screen_Material_Diameter,
        @DecimalMin("0.001") @DecimalMax("1") Double Screen_to_Glass_Distance,
        @DecimalMin("0") @DecimalMax("1") Double Top_Opening_Multiplier,
        @DecimalMin("0") @DecimalMax("1") Double Bottom_Opening_Multiplier,
        @DecimalMin("0") @DecimalMax("1") Double Left_Side_Opening_Multiplier,
        @DecimalMin("0") @DecimalMax("1") Double Right_Side_Opening_Multiplier,
        @Pattern(regexp = "0|1|2|3|5") String Angle_of_Resolution_for_Screen_Transmittance_Output_Map
) implements IddPropertiesRecord {
    // These assignments supply defaults only for fields omitted by the caller.
    public Screen {
        Reflected_Beam_Transmittance_Accounting_Method =
                Reflected_Beam_Transmittance_Accounting_Method == null
                        ? "ModelAsDiffuse" : Reflected_Beam_Transmittance_Accounting_Method;
        Diffuse_Solar_Reflectance = Diffuse_Solar_Reflectance == null ? 0.1 : Diffuse_Solar_Reflectance;
        Diffuse_Visible_Reflectance = Diffuse_Visible_Reflectance == null ? 0.1 : Diffuse_Visible_Reflectance;
        Thermal_Hemispherical_Emissivity = Thermal_Hemispherical_Emissivity == null
                ? 0.9 : Thermal_Hemispherical_Emissivity;
        Conductivity = Conductivity == null ? 221.0 : Conductivity;
        Screen_Material_Spacing = Screen_Material_Spacing == null ? 0.001 : Screen_Material_Spacing;
        Screen_Material_Diameter = Screen_Material_Diameter == null ? 0.0005 : Screen_Material_Diameter;
        Screen_to_Glass_Distance = Screen_to_Glass_Distance == null ? 0.025 : Screen_to_Glass_Distance;
        Top_Opening_Multiplier = Top_Opening_Multiplier == null ? 0.0 : Top_Opening_Multiplier;
        Bottom_Opening_Multiplier = Bottom_Opening_Multiplier == null ? 0.0 : Bottom_Opening_Multiplier;
        Left_Side_Opening_Multiplier = Left_Side_Opening_Multiplier == null
                ? 0.0 : Left_Side_Opening_Multiplier;
        Right_Side_Opening_Multiplier = Right_Side_Opening_Multiplier == null
                ? 0.0 : Right_Side_Opening_Multiplier;
        Angle_of_Resolution_for_Screen_Transmittance_Output_Map =
                Angle_of_Resolution_for_Screen_Transmittance_Output_Map == null
                        ? "0" : Angle_of_Resolution_for_Screen_Transmittance_Output_Map;
    }
}
