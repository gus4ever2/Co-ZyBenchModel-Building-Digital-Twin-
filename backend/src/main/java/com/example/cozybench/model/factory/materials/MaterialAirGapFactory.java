package com.example.cozybench.model.factory.materials;

import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.MaterialTypeEnum;
import com.example.cozybench.model.factory.AbstractFactory;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import com.example.cozybench.model.validationRecords.materials.AirGapPropertiesIdfObjectRecord;

import java.util.LinkedHashMap;
import java.util.Map;

public class MaterialAirGapFactory extends AbstractFactory<AirGapPropertiesIdfObjectRecord> {

    public MaterialAirGapFactory(){
        super(MaterialTypeEnum.MATERIAL_AIR_GAP);
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createFromProperties(Map<String, String> properties) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = AirGapPropertiesIdfObjectRecord.builder()
                .Name(properties.get("Name"))
                .Thermal_Resistance(toDouble(properties.get("Thermal_Resistance")))
                .build();

        records.put(record, MaterialTypeEnum.MATERIAL_AIR_GAP);

        return records;
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createDefault(String name) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = AirGapPropertiesIdfObjectRecord.builder()
                .Name(name)
                .Thermal_Resistance(0.1)
                .build();

        records.put(record, MaterialTypeEnum.MATERIAL_AIR_GAP);

        return records;
    }
}
