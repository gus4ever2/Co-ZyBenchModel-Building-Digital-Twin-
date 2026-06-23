package com.example.cozybench.model.factory.loads;

import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.factory.AbstractFactory;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import com.example.cozybench.model.validationRecords.loads.WaterUseEquipmentRecord;
import com.example.cozybench.model.enums.LoadTypeEnum;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class WaterUseEquipmentFactory extends AbstractFactory<WaterUseEquipmentRecord> {

    public WaterUseEquipmentFactory() {
        super(LoadTypeEnum.WATER_USE_EQUIPMENT);
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createFromProperties(Map<String, String> properties) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = WaterUseEquipmentRecord.builder()
        .Name(properties.get("Name"))
        .End_Use_Subcategory(properties.get("End_Use_Subcategory"))
        .Peak_Flow_Rate(toDouble(properties.get("Peak_Flow_Rate")))
        .Flow_Rate_Fraction_Schedule_Name(properties.get("Flow_Rate_Fraction_Schedule_Name"))
        .Target_Temperature_Schedule_Name(properties.get("Target_Temperature_Schedule_Name"))
        .Hot_Water_Supply_Temperature_Schedule_Name(properties.get("Hot_Water_Supply_Temperature_Schedule_Name"))
        .Cold_Water_Supply_Temperature_Schedule_Name(properties.get("Cold_Water_Supply_Temperature_Schedule_Name"))
        .Zone_Name(properties.get("Zone_Name"))
        .Sensible_Fraction_Schedule_Name(properties.get("Sensible_Fraction_Schedule_Name"))
        .Latent_Fraction_Schedule_Name(properties.get("Latent_Fraction_Schedule_Name"))
                .build();

        records.put(record, LoadTypeEnum.WATER_USE_EQUIPMENT);

        return records;
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createDefault(String name) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = WaterUseEquipmentRecord.builder()
        .Name(name)
        .End_Use_Subcategory("General")
        .Peak_Flow_Rate(0.0)
        .Flow_Rate_Fraction_Schedule_Name(null)
        .Target_Temperature_Schedule_Name(null)
        .Hot_Water_Supply_Temperature_Schedule_Name(null)
        .Cold_Water_Supply_Temperature_Schedule_Name(null)
        .Zone_Name(null)
        .Sensible_Fraction_Schedule_Name(null)
        .Latent_Fraction_Schedule_Name(null)
                .build();

        records.put(record, LoadTypeEnum.WATER_USE_EQUIPMENT);

        return records;
    }
}
