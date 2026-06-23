package com.example.cozybench.model.factory.constructions;

import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.ConstructionTypeEnum;
import com.example.cozybench.model.factory.AbstractFactory;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import com.example.cozybench.model.validationRecords.constructions.ConstructionCfactorUndergroundWallPropertiesIdfObjectRecord;

import java.util.LinkedHashMap;
import java.util.Map;

public class ConstructionCfactorUndergroundWallFactory extends AbstractFactory<ConstructionCfactorUndergroundWallPropertiesIdfObjectRecord> {

    public ConstructionCfactorUndergroundWallFactory() {
        super(ConstructionTypeEnum.CONSTRUCTION_CFACTOR_UNDERGROUND_WALL);
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createFromProperties(Map<String, String> properties) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = ConstructionCfactorUndergroundWallPropertiesIdfObjectRecord.builder()
                .Name(properties.get("Name"))
                .C_Factor(toDouble(properties.get("C_Factor")))
                .Height(toDouble(properties.get("Height")))
                .build();

        records.put(record, ConstructionTypeEnum.CONSTRUCTION_CFACTOR_UNDERGROUND_WALL);

        return records;
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createDefault(String name) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = ConstructionCfactorUndergroundWallPropertiesIdfObjectRecord.builder()
                .Name(name)
                .C_Factor(1.0)
                .Height(1.0)
                .build();

        records.put(record, ConstructionTypeEnum.CONSTRUCTION_CFACTOR_UNDERGROUND_WALL);

        return records;
    }
}
