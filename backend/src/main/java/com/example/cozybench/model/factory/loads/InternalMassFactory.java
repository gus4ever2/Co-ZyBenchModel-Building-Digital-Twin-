package com.example.cozybench.model.factory.loads;

import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.factory.AbstractFactory;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import com.example.cozybench.model.validationRecords.loads.InternalMassRecord;
import com.example.cozybench.model.enums.LoadTypeEnum;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class InternalMassFactory extends AbstractFactory<InternalMassRecord> {

    public InternalMassFactory() {
        super(LoadTypeEnum.INTERNAL_MASS);
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createFromProperties(Map<String, String> properties) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = InternalMassRecord.builder()
        .Name(properties.get("Name"))
        .Construction_Name(properties.get("Construction_Name"))
        .Zone_or_ZoneList_Name(properties.get("Zone_or_ZoneList_Name"))
        .Space_or_SpaceList_Name(properties.get("Space_or_SpaceList_Name"))
        .Surface_Area(toDouble(properties.get("Surface_Area")))
                .build();

        records.put(record, LoadTypeEnum.INTERNAL_MASS);

        return records;
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createDefault(String name) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = InternalMassRecord.builder()
        .Name(name)
        .Construction_Name("")
        .Zone_or_ZoneList_Name("")
        .Space_or_SpaceList_Name(null)
        .Surface_Area(0.0)
                .build();

        records.put(record, LoadTypeEnum.INTERNAL_MASS);

        return records;
    }
}
