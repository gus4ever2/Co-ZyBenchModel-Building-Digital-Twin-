package com.example.cozybench.model.factory.loads;

import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.factory.AbstractFactory;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import com.example.cozybench.model.validationRecords.loads.LightsRecord;
import com.example.cozybench.model.enums.LoadTypeEnum;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class LightsFactory extends AbstractFactory<LightsRecord> {

    public LightsFactory() {
        super(LoadTypeEnum.LIGHTS);
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createFromProperties(Map<String, String> properties) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = LightsRecord.builder()
        .Name(properties.get("Name"))
        .Zone_or_ZoneList_or_Space_or_SpaceList_Name(properties.get("Zone_or_ZoneList_or_Space_or_SpaceList_Name"))
        .Schedule_Name(properties.get("Schedule_Name"))
        .Design_Level_Calculation_Method(properties.get("Design_Level_Calculation_Method"))
        .Lighting_Level(toDouble(properties.get("Lighting_Level")))
        .Watts_per_Zone_Floor_Area(toDouble(properties.get("Watts_per_Zone_Floor_Area")))
        .Watts_per_Person(toDouble(properties.get("Watts_per_Person")))
        .Return_Air_Fraction(toDouble(properties.get("Return_Air_Fraction")))
        .Fraction_Radiant(toDouble(properties.get("Fraction_Radiant")))
        .Fraction_Visible(toDouble(properties.get("Fraction_Visible")))
        .Fraction_Replaceable(toDouble(properties.get("Fraction_Replaceable")))
        .End_Use_Subcategory(properties.get("End_Use_Subcategory"))
        .Return_Air_Fraction_Calculated_from_Plenum_Temperature(properties.get("Return_Air_Fraction_Calculated_from_Plenum_Temperature"))
        .Return_Air_Fraction_Function_of_Plenum_Temperature_Coefficient_1(toDouble(properties.get("Return_Air_Fraction_Function_of_Plenum_Temperature_Coefficient_1")))
        .Return_Air_Fraction_Function_of_Plenum_Temperature_Coefficient_2(toDouble(properties.get("Return_Air_Fraction_Function_of_Plenum_Temperature_Coefficient_2")))
        .Return_Air_Heat_Gain_Node_Name(properties.get("Return_Air_Heat_Gain_Node_Name"))
        .Exhaust_Air_Heat_Gain_Node_Name(properties.get("Exhaust_Air_Heat_Gain_Node_Name"))
                .build();

        records.put(record, LoadTypeEnum.LIGHTS);

        return records;
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createDefault(String name) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = LightsRecord.builder()
        .Name(name)
        .Zone_or_ZoneList_or_Space_or_SpaceList_Name("")
        .Schedule_Name("")
        .Design_Level_Calculation_Method("LightingLevel")
        .Lighting_Level(null)
        .Watts_per_Zone_Floor_Area(null)
        .Watts_per_Person(null)
        .Return_Air_Fraction(0.0)
        .Fraction_Radiant(0.0)
        .Fraction_Visible(0.0)
        .Fraction_Replaceable(1.0)
        .End_Use_Subcategory("General")
        .Return_Air_Fraction_Calculated_from_Plenum_Temperature("No")
        .Return_Air_Fraction_Function_of_Plenum_Temperature_Coefficient_1(0.0)
        .Return_Air_Fraction_Function_of_Plenum_Temperature_Coefficient_2(0.0)
        .Return_Air_Heat_Gain_Node_Name(null)
        .Exhaust_Air_Heat_Gain_Node_Name(null)
                .build();

        records.put(record, LoadTypeEnum.LIGHTS);

        return records;
    }
}
