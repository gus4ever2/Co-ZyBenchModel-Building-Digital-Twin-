package com.example.cozybench.model.factory.materials;

import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.WindowMaterialTypeEnum;
import com.example.cozybench.model.factory.AbstractFactory;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import com.example.cozybench.model.validationRecords.materials.WindowScreenPropertiesIdfObjectRecord;

import java.util.LinkedHashMap;
import java.util.Map;

public class WindowMaterialScreenFactory extends AbstractFactory<WindowScreenPropertiesIdfObjectRecord> {

    public WindowMaterialScreenFactory(){
        super(WindowMaterialTypeEnum.WINDOW_MATERIAL_SCREEN);
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createFromProperties(Map<String, String> properties) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = WindowScreenPropertiesIdfObjectRecord.builder()
                .Name(properties.get("Name"))
                .Reflected_Beam_Transmittance_Accounting_Method(properties.get("Reflected_Beam_Transmittance_Accounting_Method"))
                .Diffuse_Solar_Reflectance(toDouble(properties.get("Diffuse_Solar_Reflectance")))
                .Diffuse_Visible_Reflectance(toDouble(properties.get("Diffuse_Visible_Reflectance")))
                .Thermal_Hemispherical_Emissivity(toDouble(properties.get("Thermal_Hemispherical_Emissivity")))
                .Conductivity(toDouble(properties.get("Conductivity")))
                .Screen_Material_Spacing(toDouble(properties.get("Screen_Material_Spacing")))
                .Screen_Material_Diameter(toDouble(properties.get("Screen_Material_Diameter")))
                .Screen_to_Glass_Distance(toDouble(properties.get("Screen_to_Glass_Distance")))
                .Top_Opening_Multiplier(toDouble(properties.get("Top_Opening_Multiplier")))
                .Bottom_Opening_Multiplier(toDouble(properties.get("Bottom_Opening_Multiplier")))
                .Left_Side_Opening_Multiplier(toDouble(properties.get("Left_Side_Opening_Multiplier")))
                .Right_Side_Opening_Multiplier(toDouble(properties.get("Right_Side_Opening_Multiplier")))
                .Angle_of_Resolution_for_Screen_Transmittance_Output_Map(properties.get("Angle_of_Resolution_for_Screen_Transmittance_Output_Map"))
                .build();

        records.put(record, WindowMaterialTypeEnum.WINDOW_MATERIAL_SCREEN);

        return records;
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createDefault(String name) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = WindowScreenPropertiesIdfObjectRecord.builder()
                .Name(name)
                .Reflected_Beam_Transmittance_Accounting_Method("ModelAsDiffuse")
                .Diffuse_Solar_Reflectance(0.0)
                .Diffuse_Visible_Reflectance(0.0)
                .Thermal_Hemispherical_Emissivity(0.9)
                .Conductivity(221.0)
                .Screen_Material_Spacing(0.1)
                .Screen_Material_Diameter(0.1)
                .Screen_to_Glass_Distance(0.025)
                .Top_Opening_Multiplier(0.0)
                .Bottom_Opening_Multiplier(0.0)
                .Left_Side_Opening_Multiplier(0.0)
                .Right_Side_Opening_Multiplier(0.0)
                .Angle_of_Resolution_for_Screen_Transmittance_Output_Map("0")
                .build();

        records.put(record, WindowMaterialTypeEnum.WINDOW_MATERIAL_SCREEN);

        return records;
    }
}
