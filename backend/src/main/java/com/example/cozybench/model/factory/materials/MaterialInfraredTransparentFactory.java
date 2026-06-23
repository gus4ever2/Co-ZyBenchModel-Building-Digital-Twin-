package com.example.cozybench.model.factory.materials;

import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.MaterialTypeEnum;
import com.example.cozybench.model.factory.AbstractFactory;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import com.example.cozybench.model.validationRecords.materials.InfraredTransparentPropertiesIdfObjectRecord;

import java.util.LinkedHashMap;
import java.util.Map;

public class MaterialInfraredTransparentFactory extends AbstractFactory<InfraredTransparentPropertiesIdfObjectRecord> {

    public MaterialInfraredTransparentFactory(){
        super(MaterialTypeEnum.MATERIAL_INFRARED_TRANSPARENT);
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createFromProperties(Map<String, String> properties) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = InfraredTransparentPropertiesIdfObjectRecord.builder()
                .Name(properties.get("Name"))
                .build();

        records.put(record, MaterialTypeEnum.MATERIAL_INFRARED_TRANSPARENT);

        return records;
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createDefault(String name) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = InfraredTransparentPropertiesIdfObjectRecord.builder()
                .Name(name)
                .build();

        records.put(record, MaterialTypeEnum.MATERIAL_INFRARED_TRANSPARENT);

        return records;
    }
}
