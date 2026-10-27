package com.cozybench.building.idfobject.material;

import com.cozybench.building.model.validation.IddPropertiesRecord;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;

/** Schema and defaults for EnergyPlus {@code WindowMaterial:Blind}. */
@Builder
public record Blind(
        @NotBlank String Name,
        @Pattern(regexp = "Horizontal|Vertical") String Slat_Orientation,
        @NotNull @DecimalMin(value = "0", inclusive = false) @DecimalMax("1") Double Slat_Width,
        @NotNull @DecimalMin(value = "0", inclusive = false) @DecimalMax("1") Double Slat_Separation,
        @DecimalMin(value = "0", inclusive = false) @DecimalMax("0.1") Double Slat_Thickness,
        @DecimalMin("0") @DecimalMax("180") Double Slat_Angle,
        @DecimalMin(value = "0", inclusive = false) Double Slat_Conductivity,
        @DecimalMin("0") @DecimalMax(value = "1", inclusive = false) Double Slat_Beam_Solar_Transmittance,
        @NotNull @DecimalMin("0") @DecimalMax(value = "1", inclusive = false)
        Double Front_Side_Slat_Beam_Solar_Reflectance,
        @NotNull @DecimalMin("0") @DecimalMax(value = "1", inclusive = false)
        Double Back_Side_Slat_Beam_Solar_Reflectance,
        @DecimalMin("0") @DecimalMax(value = "1", inclusive = false) Double Slat_Diffuse_Solar_Transmittance,
        @NotNull @DecimalMin("0") @DecimalMax(value = "1", inclusive = false)
        Double Front_Side_Slat_Diffuse_Solar_Reflectance,
        @NotNull @DecimalMin("0") @DecimalMax(value = "1", inclusive = false)
        Double Back_Side_Slat_Diffuse_Solar_Reflectance,
        @NotNull @DecimalMin("0") @DecimalMax(value = "1", inclusive = false)
        Double Slat_Beam_Visible_Transmittance,
        @DecimalMin("0") @DecimalMax(value = "1", inclusive = false)
        Double Front_Side_Slat_Beam_Visible_Reflectance,
        @DecimalMin("0") @DecimalMax(value = "1", inclusive = false)
        Double Back_Side_Slat_Beam_Visible_Reflectance,
        @DecimalMin("0") @DecimalMax(value = "1", inclusive = false)
        Double Slat_Diffuse_Visible_Transmittance,
        @DecimalMin("0") @DecimalMax(value = "1", inclusive = false)
        Double Front_Side_Slat_Diffuse_Visible_Reflectance,
        @DecimalMin("0") @DecimalMax(value = "1", inclusive = false)
        Double Back_Side_Slat_Diffuse_Visible_Reflectance,
        @DecimalMin("0") @DecimalMax(value = "1", inclusive = false)
        Double Slat_Infrared_Hemispherical_Transmittance,
        @DecimalMin("0") @DecimalMax(value = "1", inclusive = false)
        Double Front_Side_Slat_Infrared_Hemispherical_Emissivity,
        @DecimalMin("0") @DecimalMax(value = "1", inclusive = false)
        Double Back_Side_Slat_Infrared_Hemispherical_Emissivity,
        @DecimalMin("0.01") @DecimalMax("1") Double Blind_to_Glass_Distance,
        @DecimalMin("0") @DecimalMax("1") Double Blind_Top_Opening_Multiplier,
        @DecimalMin("0") @DecimalMax("1") Double Blind_Bottom_Opening_Multiplier,
        @DecimalMin("0") @DecimalMax("1") Double Blind_Left_Side_Opening_Multiplier,
        @DecimalMin("0") @DecimalMax("1") Double Blind_Right_Side_Opening_Multiplier,
        @DecimalMin("0") @DecimalMax("180") Double Minimum_Slat_Angle,
        @DecimalMin("0") @DecimalMax("180") Double Maximum_Slat_Angle
) implements IddPropertiesRecord {
    // Fill values omitted by the builder before the factory validates this record.
    public Blind {
        Slat_Orientation = Slat_Orientation == null ? "Horizontal" : Slat_Orientation;
        Slat_Width = Slat_Width == null ? 0.025 : Slat_Width;
        Slat_Separation = Slat_Separation == null ? 0.02 : Slat_Separation;
        Slat_Thickness = Slat_Thickness == null ? 0.00025 : Slat_Thickness;
        Slat_Angle = Slat_Angle == null ? 45.0 : Slat_Angle;
        Slat_Conductivity = Slat_Conductivity == null ? 221.0 : Slat_Conductivity;
        Slat_Beam_Solar_Transmittance = Slat_Beam_Solar_Transmittance == null
                ? 0.0 : Slat_Beam_Solar_Transmittance;
        Front_Side_Slat_Beam_Solar_Reflectance = Front_Side_Slat_Beam_Solar_Reflectance == null
                ? 0.5 : Front_Side_Slat_Beam_Solar_Reflectance;
        Back_Side_Slat_Beam_Solar_Reflectance = Back_Side_Slat_Beam_Solar_Reflectance == null
                ? 0.5 : Back_Side_Slat_Beam_Solar_Reflectance;
        Slat_Diffuse_Solar_Transmittance = Slat_Diffuse_Solar_Transmittance == null
                ? 0.0 : Slat_Diffuse_Solar_Transmittance;
        Front_Side_Slat_Diffuse_Solar_Reflectance = Front_Side_Slat_Diffuse_Solar_Reflectance == null
                ? 0.5 : Front_Side_Slat_Diffuse_Solar_Reflectance;
        Back_Side_Slat_Diffuse_Solar_Reflectance = Back_Side_Slat_Diffuse_Solar_Reflectance == null
                ? 0.5 : Back_Side_Slat_Diffuse_Solar_Reflectance;
        Slat_Beam_Visible_Transmittance = Slat_Beam_Visible_Transmittance == null
                ? 0.0 : Slat_Beam_Visible_Transmittance;
        Front_Side_Slat_Beam_Visible_Reflectance = Front_Side_Slat_Beam_Visible_Reflectance == null
                ? 0.5 : Front_Side_Slat_Beam_Visible_Reflectance;
        Back_Side_Slat_Beam_Visible_Reflectance = Back_Side_Slat_Beam_Visible_Reflectance == null
                ? 0.5 : Back_Side_Slat_Beam_Visible_Reflectance;
        Slat_Diffuse_Visible_Transmittance = Slat_Diffuse_Visible_Transmittance == null
                ? 0.0 : Slat_Diffuse_Visible_Transmittance;
        Front_Side_Slat_Diffuse_Visible_Reflectance = Front_Side_Slat_Diffuse_Visible_Reflectance == null
                ? 0.5 : Front_Side_Slat_Diffuse_Visible_Reflectance;
        Back_Side_Slat_Diffuse_Visible_Reflectance = Back_Side_Slat_Diffuse_Visible_Reflectance == null
                ? 0.5 : Back_Side_Slat_Diffuse_Visible_Reflectance;
        Slat_Infrared_Hemispherical_Transmittance = Slat_Infrared_Hemispherical_Transmittance == null
                ? 0.0 : Slat_Infrared_Hemispherical_Transmittance;
        Front_Side_Slat_Infrared_Hemispherical_Emissivity =
                Front_Side_Slat_Infrared_Hemispherical_Emissivity == null
                        ? 0.9 : Front_Side_Slat_Infrared_Hemispherical_Emissivity;
        Back_Side_Slat_Infrared_Hemispherical_Emissivity =
                Back_Side_Slat_Infrared_Hemispherical_Emissivity == null
                        ? 0.9 : Back_Side_Slat_Infrared_Hemispherical_Emissivity;
        Blind_to_Glass_Distance = Blind_to_Glass_Distance == null ? 0.05 : Blind_to_Glass_Distance;
        Blind_Top_Opening_Multiplier = Blind_Top_Opening_Multiplier == null
                ? 0.5 : Blind_Top_Opening_Multiplier;
        Blind_Bottom_Opening_Multiplier = Blind_Bottom_Opening_Multiplier == null
                ? 0.0 : Blind_Bottom_Opening_Multiplier;
        Blind_Left_Side_Opening_Multiplier = Blind_Left_Side_Opening_Multiplier == null
                ? 0.5 : Blind_Left_Side_Opening_Multiplier;
        Blind_Right_Side_Opening_Multiplier = Blind_Right_Side_Opening_Multiplier == null
                ? 0.5 : Blind_Right_Side_Opening_Multiplier;
        Minimum_Slat_Angle = Minimum_Slat_Angle == null ? 0.0 : Minimum_Slat_Angle;
        Maximum_Slat_Angle = Maximum_Slat_Angle == null ? 180.0 : Maximum_Slat_Angle;
    }
}
