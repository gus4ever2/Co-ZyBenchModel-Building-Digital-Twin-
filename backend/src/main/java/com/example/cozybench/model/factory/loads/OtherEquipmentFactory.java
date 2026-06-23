package com.example.cozybench.model.factory.loads;

import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.factory.AbstractFactory;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import com.example.cozybench.model.validationRecords.loads.OtherEquipmentRecord;
import com.example.cozybench.model.enums.LoadTypeEnum;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class OtherEquipmentFactory extends AbstractFactory<OtherEquipmentRecord> {

    public OtherEquipmentFactory() {
        super(LoadTypeEnum.OTHER_EQUIPMENT);
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createFromProperties(Map<String, String> properties) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = OtherEquipmentRecord.builder()
        .Name(properties.get("Name"))
        .Fuel_Type(properties.get("Fuel_Type"))
        .Zone_or_ZoneList_or_Space_or_SpaceList_Name(properties.get("Zone_or_ZoneList_or_Space_or_SpaceList_Name"))
        .Schedule_Name(properties.get("Schedule_Name"))
        .Design_Level_Calculation_Method(properties.get("Design_Level_Calculation_Method"))
        .Design_Level(toDouble(properties.get("Design_Level")))
        .Power_per_Zone_Floor_Area(toDouble(properties.get("Power_per_Zone_Floor_Area")))
        .Power_per_Person(toDouble(properties.get("Power_per_Person")))
        .Fraction_Latent(toDouble(properties.get("Fraction_Latent")))
        .Fraction_Radiant(toDouble(properties.get("Fraction_Radiant")))
        .Fraction_Lost(toDouble(properties.get("Fraction_Lost")))
        .Carbon_Dioxide_Generation_Rate(toDouble(properties.get("Carbon_Dioxide_Generation_Rate")))
        .End_Use_Subcategory(properties.get("End_Use_Subcategory"))
                .build();

        records.put(record, LoadTypeEnum.OTHER_EQUIPMENT);

        return records;
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createDefault(String name) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = OtherEquipmentRecord.builder()
        .Name(name)
        .Fuel_Type("None")
        .Zone_or_ZoneList_or_Space_or_SpaceList_Name("")
        .Schedule_Name("")
        .Design_Level_Calculation_Method("EquipmentLevel")
        .Design_Level(null)
        .Power_per_Zone_Floor_Area(null)
        .Power_per_Person(null)
        .Fraction_Latent(0.0)
        .Fraction_Radiant(0.0)
        .Fraction_Lost(0.0)
        .Carbon_Dioxide_Generation_Rate(0.0)
        .End_Use_Subcategory("General")
                .build();

        records.put(record, LoadTypeEnum.OTHER_EQUIPMENT);

        return records;
    }
}
