package com.example.cozybench.model.factory.materials;

import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.WindowMaterialTypeEnum;
import com.example.cozybench.model.factory.AbstractFactory;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import com.example.cozybench.model.validationRecords.materials.WindowShadePropertiesIdfObjectRecord;

import java.util.LinkedHashMap;
import java.util.Map;

public class WindowMaterialShadeFactory extends AbstractFactory<WindowShadePropertiesIdfObjectRecord> {

    public WindowMaterialShadeFactory(){
        super(WindowMaterialTypeEnum.WINDOW_MATERIAL_SHADE);
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createFromProperties(Map<String, String> properties) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = WindowShadePropertiesIdfObjectRecord.builder()
                .Name(properties.get("Name"))
                .Solar_Transmittance(toDouble(properties.get("Solar_Transmittance")))
                .Solar_Reflectance(toDouble(properties.get("Solar_Reflectance")))
                .Visible_Transmittance(toDouble(properties.get("Visible_Transmittance")))
                .Visible_Reflectance(toDouble(properties.get("Visible_Reflectance")))
                .Infrared_Hemispherical_Emissivity(toDouble(properties.get("Infrared_Hemispherical_Emissivity")))
                .Infrared_Transmittance(toDouble(properties.get("Infrared_Transmittance")))
                .Thickness(toDouble(properties.get("Thickness")))
                .Conductivity(toDouble(properties.get("Conductivity")))
                .Shade_to_Glass_Distance(toDouble(properties.get("Shade_to_Glass_Distance")))
                .Top_Opening_Multiplier(toDouble(properties.get("Top_Opening_Multiplier")))
                .Bottom_Opening_Multiplier(toDouble(properties.get("Bottom_Opening_Multiplier")))
                .Left_Side_Opening_Multiplier(toDouble(properties.get("Left_Side_Opening_Multiplier")))
                .Right_Side_Opening_Multiplier(toDouble(properties.get("Right_Side_Opening_Multiplier")))
                .Airflow_Permeability(toDouble(properties.get("Airflow_Permeability")))
                .build();

        records.put(record, WindowMaterialTypeEnum.WINDOW_MATERIAL_SHADE);

        return records;
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createDefault(String name) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = WindowShadePropertiesIdfObjectRecord.builder()
                .Name(name)
                .Solar_Transmittance(0.0)
                .Solar_Reflectance(0.0)
                .Visible_Transmittance(0.0)
                .Visible_Reflectance(0.0)
                .Infrared_Hemispherical_Emissivity(0.1)
                .Infrared_Transmittance(0.0)
                .Thickness(0.1)
                .Conductivity(0.1)
                .Shade_to_Glass_Distance(0.05)
                .Top_Opening_Multiplier(0.5)
                .Bottom_Opening_Multiplier(0.5)
                .Left_Side_Opening_Multiplier(0.5)
                .Right_Side_Opening_Multiplier(0.5)
                .Airflow_Permeability(0.0)
                .build();

        records.put(record, WindowMaterialTypeEnum.WINDOW_MATERIAL_SHADE);

        return records;
    }
}
