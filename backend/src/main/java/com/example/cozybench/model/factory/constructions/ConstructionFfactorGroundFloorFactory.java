package com.example.cozybench.model.factory.constructions;

import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.ConstructionTypeEnum;
import com.example.cozybench.model.factory.AbstractFactory;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import com.example.cozybench.model.validationRecords.constructions.ConstructionFfactorGroundFloorPropertiesIdfObjectRecord;

import java.util.LinkedHashMap;
import java.util.Map;

public class ConstructionFfactorGroundFloorFactory extends AbstractFactory<ConstructionFfactorGroundFloorPropertiesIdfObjectRecord> {

    public ConstructionFfactorGroundFloorFactory() {
        super(ConstructionTypeEnum.CONSTRUCTION_FFACTOR_GROUND_FLOOR);
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createFromProperties(Map<String, String> properties) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = ConstructionFfactorGroundFloorPropertiesIdfObjectRecord.builder()
                .Name(properties.get("Name"))
                .F_Factor(toDouble(properties.get("F_Factor")))
                .Area(toDouble(properties.get("Area")))
                .Perimeter_Exposed(toDouble(properties.get("PerimeterExposed")))
                .build();

        records.put(record, ConstructionTypeEnum.CONSTRUCTION_FFACTOR_GROUND_FLOOR);

        return records;
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createDefault(String name) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = ConstructionFfactorGroundFloorPropertiesIdfObjectRecord.builder()
                .Name(name)
                .F_Factor(1.0)
                .Area(1.0)
                .Perimeter_Exposed(0.0)
                .build();

        records.put(record, ConstructionTypeEnum.CONSTRUCTION_FFACTOR_GROUND_FLOOR);

        return records;
    }
}
