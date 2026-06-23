package com.example.cozybench.model.factory.materials;

import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.WindowMaterialTypeEnum;
import com.example.cozybench.model.factory.AbstractFactory;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import com.example.cozybench.model.validationRecords.materials.WindowSimpleGlazingSystemPropertiesIdfObjectRecord;

import java.util.LinkedHashMap;
import java.util.Map;

public class WindowMaterialSimpleGlazingSystemFactory extends AbstractFactory<WindowSimpleGlazingSystemPropertiesIdfObjectRecord> {

    public WindowMaterialSimpleGlazingSystemFactory(){
        super(WindowMaterialTypeEnum.WINDOW_MATERIAL_SIMPLE_GLAZING_SYSTEM);
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createFromProperties(Map<String, String> properties) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = WindowSimpleGlazingSystemPropertiesIdfObjectRecord.builder()
                .Name(properties.get("Name"))
                .U_Factor(toDouble(properties.get("U_Factor")))
                .Solar_Heat_Gain_Coefficient(toDouble(properties.get("Solar_Heat_Gain_Coefficient")))
                .Visible_Transmittance(toDouble(properties.get("Visible_Transmittance")))
                .build();

        records.put(record, WindowMaterialTypeEnum.WINDOW_MATERIAL_SIMPLE_GLAZING_SYSTEM);

        return records;
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createDefault(String name) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = WindowSimpleGlazingSystemPropertiesIdfObjectRecord.builder()
                .Name(name)
                .U_Factor(0.1)
                .Solar_Heat_Gain_Coefficient(0.1)
                .Visible_Transmittance(0.1)
                .build();

        records.put(record, WindowMaterialTypeEnum.WINDOW_MATERIAL_SIMPLE_GLAZING_SYSTEM);

        return records;
    }
}
