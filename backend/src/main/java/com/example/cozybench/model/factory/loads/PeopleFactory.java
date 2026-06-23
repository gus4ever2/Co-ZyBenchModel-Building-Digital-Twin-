package com.example.cozybench.model.factory.loads;

import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.factory.AbstractFactory;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import com.example.cozybench.model.validationRecords.loads.PeopleRecord;
import com.example.cozybench.model.enums.LoadTypeEnum;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class PeopleFactory extends AbstractFactory<PeopleRecord> {

    public PeopleFactory() {
        super(LoadTypeEnum.PEOPLE);
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createFromProperties(Map<String, String> properties) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = PeopleRecord.builder()
        .Name(properties.get("Name"))
        .Zone_or_ZoneList_or_Space_or_SpaceList_Name(properties.get("Zone_or_ZoneList_or_Space_or_SpaceList_Name"))
        .Number_of_People_Schedule_Name(properties.get("Number_of_People_Schedule_Name"))
        .Number_of_People_Calculation_Method(properties.get("Number_of_People_Calculation_Method"))
        .Number_of_People(toDouble(properties.get("Number_of_People")))
        .People_per_Floor_Area(toDouble(properties.get("People_per_Floor_Area")))
        .Floor_Area_per_Person(toDouble(properties.get("Floor_Area_per_Person")))
        .Fraction_Radiant(toDouble(properties.get("Fraction_Radiant")))
        .Sensible_Heat_Fraction(properties.get("Sensible_Heat_Fraction"))
        .Activity_Level_Schedule_Name(properties.get("Activity_Level_Schedule_Name"))
        .Carbon_Dioxide_Generation_Rate(toDouble(properties.get("Carbon_Dioxide_Generation_Rate")))
        .Enable_ASHRAE_55_Comfort_Warnings(properties.get("Enable_ASHRAE_55_Comfort_Warnings"))
        .Mean_Radiant_Temperature_Calculation_Type(properties.get("Mean_Radiant_Temperature_Calculation_Type"))
        .Surface_Name_Angle_Factor_List_Name(properties.get("Surface_Name_Angle_Factor_List_Name"))
        .Work_Efficiency_Schedule_Name(properties.get("Work_Efficiency_Schedule_Name"))
        .Clothing_Insulation_Calculation_Method(properties.get("Clothing_Insulation_Calculation_Method"))
        .Clothing_Insulation_Calculation_Method_Schedule_Name(properties.get("Clothing_Insulation_Calculation_Method_Schedule_Name"))
        .Clothing_Insulation_Schedule_Name(properties.get("Clothing_Insulation_Schedule_Name"))
        .Air_Velocity_Schedule_Name(properties.get("Air_Velocity_Schedule_Name"))
        .Thermal_Comfort_Model_1_Type(properties.get("Thermal_Comfort_Model_1_Type"))
        .Thermal_Comfort_Model_2_Type(properties.get("Thermal_Comfort_Model_2_Type"))
        .Thermal_Comfort_Model_3_Type(properties.get("Thermal_Comfort_Model_3_Type"))
        .Thermal_Comfort_Model_4_Type(properties.get("Thermal_Comfort_Model_4_Type"))
        .Thermal_Comfort_Model_5_Type(properties.get("Thermal_Comfort_Model_5_Type"))
        .Thermal_Comfort_Model_6_Type(properties.get("Thermal_Comfort_Model_6_Type"))
        .Thermal_Comfort_Model_7_Type(properties.get("Thermal_Comfort_Model_7_Type"))
        .Ankle_Level_Air_Velocity_Schedule_Name(properties.get("Ankle_Level_Air_Velocity_Schedule_Name"))
        .Cold_Stress_Temperature_Threshold(toDouble(properties.get("Cold_Stress_Temperature_Threshold")))
        .Heat_Stress_Temperature_Threshold(toDouble(properties.get("Heat_Stress_Temperature_Threshold")))
                .build();

        records.put(record, LoadTypeEnum.PEOPLE);

        return records;
    }

    @Override
    public Map<IdfObjectRecord, TypeEnumInterface> createDefault(String name) {
        Map<IdfObjectRecord, TypeEnumInterface> records = new LinkedHashMap<>();

        IdfObjectRecord record = PeopleRecord.builder()
        .Name(name)
        .Zone_or_ZoneList_or_Space_or_SpaceList_Name("")
        .Number_of_People_Schedule_Name("")
        .Number_of_People_Calculation_Method("People")
        .Number_of_People(null)
        .People_per_Floor_Area(null)
        .Floor_Area_per_Person(null)
        .Fraction_Radiant(0.3)
        .Sensible_Heat_Fraction("autocalculate")
        .Activity_Level_Schedule_Name("")
        .Carbon_Dioxide_Generation_Rate(3.82E-8)
        .Enable_ASHRAE_55_Comfort_Warnings("No")
        .Mean_Radiant_Temperature_Calculation_Type("ZoneAveraged")
        .Surface_Name_Angle_Factor_List_Name(null)
        .Work_Efficiency_Schedule_Name(null)
        .Clothing_Insulation_Calculation_Method("ClothingInsulationSchedule")
        .Clothing_Insulation_Calculation_Method_Schedule_Name(null)
        .Clothing_Insulation_Schedule_Name(null)
        .Air_Velocity_Schedule_Name(null)
        .Thermal_Comfort_Model_1_Type(null)
        .Thermal_Comfort_Model_2_Type(null)
        .Thermal_Comfort_Model_3_Type(null)
        .Thermal_Comfort_Model_4_Type(null)
        .Thermal_Comfort_Model_5_Type(null)
        .Thermal_Comfort_Model_6_Type(null)
        .Thermal_Comfort_Model_7_Type(null)
        .Ankle_Level_Air_Velocity_Schedule_Name(null)
        .Cold_Stress_Temperature_Threshold(15.56)
        .Heat_Stress_Temperature_Threshold(30.0)
                .build();

        records.put(record, LoadTypeEnum.PEOPLE);

        return records;
    }
}
