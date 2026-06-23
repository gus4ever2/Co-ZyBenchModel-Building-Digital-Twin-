package com.example.cozybench.model.factory.constructions;

import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.ConstructionTypeEnum;
import com.example.cozybench.model.factory.AbstractFactory;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import com.example.cozybench.model.validationRecords.constructions.ConstructionAirBoundaryPropertiesIdfObjectRecord;

import java.util.LinkedHashMap;
import java.util.Map;

public class ConstructionAirBoundaryFactory
        extends AbstractFactory<ConstructionAirBoundaryPropertiesIdfObjectRecord> {

    public ConstructionAirBoundaryFactory() {
        super(ConstructionTypeEnum.CONSTRUCTION_AIR_BOUNDARY);
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createFromProperties(
            Map<String, String> properties
    ) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        ConstructionAirBoundaryPropertiesIdfObjectRecord record =
                ConstructionAirBoundaryPropertiesIdfObjectRecord.builder()
                        .Name(properties.get("Name"))
                        .Air_Exchange_Method(properties.get("Air_Exchange_Method"))
                        .Simple_Mixing_Air_Changes_per_Hour(
                                toDouble(properties.get("Simple_Mixing_Air_Changes_per_Hour"))
                        )
                        .Simple_Mixing_Schedule_Name(
                                properties.get("Simple_Mixing_Schedule_Name")
                        )
                        .build();

        records.put(record, ConstructionTypeEnum.CONSTRUCTION_AIR_BOUNDARY);

        return records;
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createDefault(String name) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        ConstructionAirBoundaryPropertiesIdfObjectRecord record =
                ConstructionAirBoundaryPropertiesIdfObjectRecord.builder()
                        .Name(name)
                        .Air_Exchange_Method("None")
                        .Simple_Mixing_Air_Changes_per_Hour(0.0)
                        .Simple_Mixing_Schedule_Name("")
                        .build();

        records.put(record, ConstructionTypeEnum.CONSTRUCTION_AIR_BOUNDARY);

        return records;
    }
}