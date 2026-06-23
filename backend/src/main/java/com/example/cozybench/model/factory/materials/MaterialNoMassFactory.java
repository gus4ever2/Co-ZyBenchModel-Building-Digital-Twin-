package com.example.cozybench.model.factory.materials;

import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.MaterialTypeEnum;
import com.example.cozybench.model.factory.AbstractFactory;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import com.example.cozybench.model.validationRecords.materials.NoMassPropertiesIdfObjectRecord;

import java.util.LinkedHashMap;
import java.util.Map;

public class MaterialNoMassFactory extends AbstractFactory<NoMassPropertiesIdfObjectRecord> {

    public MaterialNoMassFactory(){
        super(MaterialTypeEnum.MATERIAL_NO_MASS);
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createFromProperties(Map<String, String> properties) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = NoMassPropertiesIdfObjectRecord.builder()
                .Name(properties.get("Name"))
                .Roughness(properties.get("Roughness"))
                .Thermal_Resistance(toDouble(properties.get("Thermal_Resistance")))
                .Thermal_Absorptance(toDouble(properties.get("Thermal_Absorptance")))
                .Solar_Absorptance(toDouble(properties.get("Solar_Absorptance")))
                .Visible_Absorptance(toDouble(properties.get("Visible_Absorptance")))
                .build();

        records.put(record, MaterialTypeEnum.MATERIAL_NO_MASS);

        return records;
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createDefault(String name) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = NoMassPropertiesIdfObjectRecord.builder()
                .Name(name)
                .Roughness("VeryRough")
                .Thermal_Resistance(0.001)
                .Thermal_Absorptance(0.9)
                .Solar_Absorptance(0.7)
                .Visible_Absorptance(0.7)
                .build();

        records.put(record, MaterialTypeEnum.MATERIAL_NO_MASS);

        return records;
    }
}
