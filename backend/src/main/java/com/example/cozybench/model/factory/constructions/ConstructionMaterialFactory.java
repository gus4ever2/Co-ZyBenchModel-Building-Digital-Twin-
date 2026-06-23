package com.example.cozybench.model.factory.constructions;

import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.ConstructionTypeEnum;
import com.example.cozybench.model.factory.AbstractFactory;
import com.example.cozybench.model.factory.materials.MaterialFactory;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import com.example.cozybench.model.validationRecords.constructions.ConstructionMaterialPropertiesIdfObjectRecord;
import com.example.cozybench.service.constructionSet.ValidationService;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class ConstructionMaterialFactory extends AbstractFactory<ConstructionMaterialPropertiesIdfObjectRecord> {

    public ConstructionMaterialFactory() {
        super(ConstructionTypeEnum.CONSTRUCTION);
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createFromProperties(Map<String, String> properties) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = ConstructionMaterialPropertiesIdfObjectRecord.builder()
                .Name(properties.get("Name"))
                .Outside_Layer(properties.get("Outside_Layer"))
                .Layer_2(properties.get("Layer_2"))
                .Layer_3(properties.get("Layer_3"))
                .Layer_4(properties.get("Layer_4"))
                .Layer_5(properties.get("Layer_5"))
                .Layer_6(properties.get("Layer_6"))
                .Layer_7(properties.get("Layer_7"))
                .Layer_8(properties.get("Layer_8"))
                .Layer_9(properties.get("Layer_9"))
                .Layer_10(properties.get("Layer_10"))
                .build();

        records.put(record, ConstructionTypeEnum.CONSTRUCTION);

        return records;
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createDefault(String name) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = ConstructionMaterialPropertiesIdfObjectRecord.builder()
                .Name(name)
                .Outside_Layer(null)
                .Layer_2("")
                .Layer_3("")
                .Layer_4("")
                .Layer_5("")
                .Layer_6("")
                .Layer_7("")
                .Layer_8("")
                .Layer_9("")
                .Layer_10("")
                .build();

        records.put(record, ConstructionTypeEnum.CONSTRUCTION);

        return records;
    }
}
