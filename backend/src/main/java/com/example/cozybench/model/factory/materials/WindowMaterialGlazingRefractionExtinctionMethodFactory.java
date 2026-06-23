package com.example.cozybench.model.factory.materials;

import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.WindowMaterialTypeEnum;
import com.example.cozybench.model.factory.AbstractFactory;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import com.example.cozybench.model.validationRecords.materials.WindowGlazingRefractionExtinctionMethodPropertiesIdfObjectRecord;

import java.util.LinkedHashMap;
import java.util.Map;

public class WindowMaterialGlazingRefractionExtinctionMethodFactory extends AbstractFactory<WindowGlazingRefractionExtinctionMethodPropertiesIdfObjectRecord> {

    public WindowMaterialGlazingRefractionExtinctionMethodFactory(){
        super(WindowMaterialTypeEnum.WINDOW_MATERIAL_GLAZING_REFRACTION_EXTINCTION_METHOD);
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createFromProperties(Map<String, String> properties) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = WindowGlazingRefractionExtinctionMethodPropertiesIdfObjectRecord.builder()
                .Name(properties.get("Name"))
                .Thickness(toDouble(properties.get("Thickness")))
                .Solar_Index_of_Refraction(toDouble(properties.get("Solar_Index_of_Refraction")))
                .Solar_Extinction_Coefficient(toDouble(properties.get("Solar_Extinction_Coefficient")))
                .Visible_Index_of_Refraction(toDouble(properties.get("Visible_Index_of_Refraction")))
                .Visible_Extinction_Coefficient(toDouble(properties.get("Visible_Extinction_Coefficient")))
                .Infrared_Transmittance_at_Normal_Incidence(toDouble(properties.get("Infrared_Transmittance_at_Normal_Incidence")))
                .Infrared_Hemispherical_Emissivity(toDouble(properties.get("Infrared_Hemispherical_Emissivity")))
                .Conductivity(toDouble(properties.get("Conductivity")))
                .Dirt_Correction_Factor_for_Solar_and_Visible_Transmittance(toDouble(properties.get("Dirt_Correction_Factor_for_Solar_and_Visible_Transmittance")))
                .Solar_Diffusing(properties.get("Solar_Diffusing"))
                .build();

        records.put(record, WindowMaterialTypeEnum.WINDOW_MATERIAL_GLAZING_REFRACTION_EXTINCTION_METHOD);

        return records;
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createDefault(String name) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = WindowGlazingRefractionExtinctionMethodPropertiesIdfObjectRecord.builder()
                .Name(name)
                .Thickness(0.1)
                .Solar_Index_of_Refraction(1.1)
                .Solar_Extinction_Coefficient(0.1)
                .Visible_Index_of_Refraction(1.1)
                .Visible_Extinction_Coefficient(0.1)
                .Infrared_Transmittance_at_Normal_Incidence(0.0)
                .Infrared_Hemispherical_Emissivity(0.84)
                .Conductivity(0.9)
                .Dirt_Correction_Factor_for_Solar_and_Visible_Transmittance(1.0)
                .Solar_Diffusing("No")
                .build();

        records.put(record, WindowMaterialTypeEnum.WINDOW_MATERIAL_GLAZING_REFRACTION_EXTINCTION_METHOD);

        return records;
    }
}
