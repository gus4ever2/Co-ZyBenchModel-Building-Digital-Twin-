package com.example.cozybench.model.factory.materials;

import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.WindowMaterialTypeEnum;
import com.example.cozybench.model.factory.AbstractFactory;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import com.example.cozybench.model.validationRecords.materials.WindowBlindPropertiesIdfObjectRecord;

import java.util.LinkedHashMap;
import java.util.Map;

public class WindowMaterialBlindFactory extends AbstractFactory<WindowBlindPropertiesIdfObjectRecord> {

    public WindowMaterialBlindFactory(){
        super(WindowMaterialTypeEnum.WINDOW_MATERIAL_BLIND);
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createFromProperties(Map<String, String> properties) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = WindowBlindPropertiesIdfObjectRecord.builder()
                .Name(properties.get("Name"))
                .Slat_Orientation(properties.get("Slat_Orientation"))
                .Slat_Width(toDouble(properties.get("Slat_Width")))
                .Slat_Separation(toDouble(properties.get("Slat_Separation")))
                .Slat_Thickness(toDouble(properties.get("Slat_Thickness")))
                .Slat_Angle(toDouble(properties.get("Slat_Angle")))
                .Slat_Conductivity(toDouble(properties.get("Slat_Conductivity")))
                .Slat_Beam_Solar_Transmittance(toDouble(properties.get("Slat_Beam_Solar_Transmittance")))
                .Front_Side_Slat_Beam_Solar_Reflectance(toDouble(properties.get("Front_Side_Slat_Beam_Solar_Reflectance")))
                .Back_Side_Slat_Beam_Solar_Reflectance(toDouble(properties.get("Back_Side_Slat_Beam_Solar_Reflectance")))
                .Slat_Diffuse_Solar_Transmittance(toDouble(properties.get("Slat_Diffuse_Solar_Transmittance")))
                .Front_Side_Slat_Diffuse_Solar_Reflectance(toDouble(properties.get("Front_Side_Slat_Diffuse_Solar_Reflectance")))
                .Back_Side_Slat_Diffuse_Solar_Reflectance(toDouble(properties.get("Back_Side_Slat_Diffuse_Solar_Reflectance")))
                .Slat_Beam_Visible_Transmittance(toDouble(properties.get("Slat_Beam_Visible_Transmittance")))
                .Front_Side_Slat_Beam_Visible_Reflectance(toDouble(properties.get("Front_Side_Slat_Beam_Visible_Reflectance")))
                .Back_Side_Slat_Beam_Visible_Reflectance(toDouble(properties.get("Back_Side_Slat_Beam_Visible_Reflectance")))
                .Slat_Diffuse_Visible_Transmittance(toDouble(properties.get("Slat_Diffuse_Visible_Transmittance")))
                .Front_Side_Slat_Diffuse_Visible_Reflectance(toDouble(properties.get("Front_Side_Slat_Diffuse_Visible_Reflectance")))
                .Back_Side_Slat_Diffuse_Visible_Reflectance(toDouble(properties.get("Back_Side_Slat_Diffuse_Visible_Reflectance")))
                .Slat_Infrared_Hemispherical_Transmittance(toDouble(properties.get("Slat_Infrared_Hemispherical_Transmittance")))
                .Front_Side_Slat_Infrared_Hemispherical_Emissivity(toDouble(properties.get("Front_Side_Slat_Infrared_Hemispherical_Emissivity")))
                .Back_Side_Slat_Infrared_Hemispherical_Emissivity(toDouble(properties.get("Back_Side_Slat_Infrared_Hemispherical_Emissivity")))
                .Blind_to_Glass_Distance(toDouble(properties.get("Blind_to_Glass_Distance")))
                .Blind_Top_Opening_Multiplier(toDouble(properties.get("Blind_Top_Opening_Multiplier")))
                .Blind_Bottom_Opening_Multiplier(toDouble(properties.get("Blind_Bottom_Opening_Multiplier")))
                .Blind_Left_Side_Opening_Multiplier(toDouble(properties.get("Blind_Left_Side_Opening_Multiplier")))
                .Blind_Right_Side_Opening_Multiplier(toDouble(properties.get("Blind_Right_Side_Opening_Multiplier")))
                .Minimum_Slat_Angle(toDouble(properties.get("Minimum_Slat_Angle")))
                .Maximum_Slat_Angle(toDouble(properties.get("Maximum_Slat_Angle")))
                .build();

        records.put(record, WindowMaterialTypeEnum.WINDOW_MATERIAL_BLIND);

        return records;
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createDefault(String name) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = WindowBlindPropertiesIdfObjectRecord.builder()
                .Name(name)
                .Slat_Orientation("Horizontal")
                .Slat_Width(0.1)
                .Slat_Separation(0.1)
                .Slat_Thickness(0.00025)
                .Slat_Angle(45.0)
                .Slat_Conductivity(221.0)
                .Slat_Beam_Solar_Transmittance(0.0)
                .Front_Side_Slat_Beam_Solar_Reflectance(0.0)
                .Back_Side_Slat_Beam_Solar_Reflectance(0.0)
                .Slat_Diffuse_Solar_Transmittance(0.0)
                .Front_Side_Slat_Diffuse_Solar_Reflectance(0.0)
                .Back_Side_Slat_Diffuse_Solar_Reflectance(0.0)
                .Slat_Beam_Visible_Transmittance(0.0)
                .Front_Side_Slat_Beam_Visible_Reflectance(0.0)
                .Back_Side_Slat_Beam_Visible_Reflectance(0.0)
                .Slat_Diffuse_Visible_Transmittance(0.0)
                .Front_Side_Slat_Diffuse_Visible_Reflectance(0.0)
                .Back_Side_Slat_Diffuse_Visible_Reflectance(0.0)
                .Slat_Infrared_Hemispherical_Transmittance(0.0)
                .Front_Side_Slat_Infrared_Hemispherical_Emissivity(0.9)
                .Back_Side_Slat_Infrared_Hemispherical_Emissivity(0.9)
                .Blind_to_Glass_Distance(0.05)
                .Blind_Top_Opening_Multiplier(0.5)
                .Blind_Bottom_Opening_Multiplier(0.0)
                .Blind_Left_Side_Opening_Multiplier(0.5)
                .Blind_Right_Side_Opening_Multiplier(0.5)
                .Minimum_Slat_Angle(0.0)
                .Maximum_Slat_Angle(180.0)
                .build();

        records.put(record, WindowMaterialTypeEnum.WINDOW_MATERIAL_BLIND);

        return records;
    }
}
