package com.example.cozybench.model.factory.materials;

import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.WindowMaterialTypeEnum;
import com.example.cozybench.model.factory.AbstractFactory;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import com.example.cozybench.model.validationRecords.materials.WindowGlazingPropertiesIdfObjectRecord;

import java.util.LinkedHashMap;
import java.util.Map;

public class WindowMaterialGlazingFactory extends AbstractFactory<WindowGlazingPropertiesIdfObjectRecord> {

    public WindowMaterialGlazingFactory(){
        super(WindowMaterialTypeEnum.WINDOW_MATERIAL_GLAZING);
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createFromProperties(Map<String, String> properties) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = WindowGlazingPropertiesIdfObjectRecord.builder()
                .Name(properties.get("Name"))
                .Optical_Data_Type(properties.get("Optical_Data_Type"))
                .Window_Glass_Spectral_Data_Set_Name(properties.get("Window_Glass_Spectral_Data_Set_Name"))
                .Thickness(toDouble(properties.get("Thickness")))
                .Solar_Transmittance_at_Normal_Incidence(toDouble(properties.get("Solar_Transmittance_at_Normal_Incidence")))
                .Front_Side_Solar_Reflectance_at_Normal_Incidence(toDouble(properties.get("Front_Side_Solar_Reflectance_at_Normal_Incidence")))
                .Back_Side_Solar_Reflectance_at_Normal_Incidence(toDouble(properties.get("Back_Side_Solar_Reflectance_at_Normal_Incidence")))
                .Visible_Transmittance_at_Normal_Incidence(toDouble(properties.get("Visible_Transmittance_at_Normal_Incidence")))
                .Front_Side_Visible_Reflectance_at_Normal_Incidence(toDouble(properties.get("Front_Side_Visible_Reflectance_at_Normal_Incidence")))
                .Back_Side_Visible_Reflectance_at_Normal_Incidence(toDouble(properties.get("Back_Side_Visible_Reflectance_at_Normal_Incidence")))
                .Infrared_Transmittance_at_Normal_Incidence(toDouble(properties.get("Infrared_Transmittance_at_Normal_Incidence")))
                .Front_Side_Infrared_Hemispherical_Emissivity(toDouble(properties.get("Front_Side_Infrared_Hemispherical_Emissivity")))
                .Back_Side_Infrared_Hemispherical_Emissivity(toDouble(properties.get("Back_Side_Infrared_Hemispherical_Emissivity")))
                .Conductivity(toDouble(properties.get("Conductivity")))
                .Dirt_Correction_Factor_for_Solar_and_Visible_Transmittance(toDouble(properties.get("Dirt_Correction_Factor_for_Solar_and_Visible_Transmittance")))
                .Solar_Diffusing(properties.get("Solar_Diffusing"))
                .Youngs_modulus(toDouble(properties.get("Youngs_modulus")))
                .Poissons_ratio(toDouble(properties.get("Poissons_ratio")))
                .Window_Glass_Spectral_and_Incident_Angle_Transmittance_Data_Set_Table_Name(properties.get("Window_Glass_Spectral_and_Incident_Angle_Transmittance_Data_Set_Table_Name"))
                .Window_Glass_Spectral_and_Incident_Angle_Front_Reflectance_Data_Set_Table_Name(properties.get("Window_Glass_Spectral_and_Incident_Angle_Front_Reflectance_Data_Set_Table_Name"))
                .Window_Glass_Spectral_and_Incident_Angle_Back_Reflectance_Data_Set_Table_Name(properties.get("Window_Glass_Spectral_and_Incident_Angle_Back_Reflectance_Data_Set_Table_Name"))
                .build();

        records.put(record, WindowMaterialTypeEnum.WINDOW_MATERIAL_GLAZING);

        return records;
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createDefault(String name) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = WindowGlazingPropertiesIdfObjectRecord.builder()
                .Name(name)
                .Optical_Data_Type("SpectralAverage")
                .Window_Glass_Spectral_Data_Set_Name(null)
                .Thickness(0.1)
                .Solar_Transmittance_at_Normal_Incidence(0.0)
                .Front_Side_Solar_Reflectance_at_Normal_Incidence(0.0)
                .Back_Side_Solar_Reflectance_at_Normal_Incidence(0.0)
                .Visible_Transmittance_at_Normal_Incidence(0.0)
                .Front_Side_Visible_Reflectance_at_Normal_Incidence(0.0)
                .Back_Side_Visible_Reflectance_at_Normal_Incidence(0.0)
                .Infrared_Transmittance_at_Normal_Incidence(0.0)
                .Front_Side_Infrared_Hemispherical_Emissivity(0.84)
                .Back_Side_Infrared_Hemispherical_Emissivity(0.84)
                .Conductivity(0.9)
                .Dirt_Correction_Factor_for_Solar_and_Visible_Transmittance(1.0)
                .Solar_Diffusing("No")
                .Youngs_modulus(72000000000.0)
                .Poissons_ratio(0.22)
                .Window_Glass_Spectral_and_Incident_Angle_Transmittance_Data_Set_Table_Name(null)
                .Window_Glass_Spectral_and_Incident_Angle_Front_Reflectance_Data_Set_Table_Name(null)
                .Window_Glass_Spectral_and_Incident_Angle_Back_Reflectance_Data_Set_Table_Name(null)
                .build();

        records.put(record, WindowMaterialTypeEnum.WINDOW_MATERIAL_GLAZING);

        return records;
    }
}
