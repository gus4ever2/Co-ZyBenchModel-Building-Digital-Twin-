package com.example.cozybench.model.validationRecords.loads;

        import com.example.cozybench.model.validationRecords.IdfObjectRecord;
        import jakarta.validation.constraints.NotBlank;
        import lombok.Builder;

        @Builder
        public record PeopleRecord(


        @NotBlank(message = "Name is required")
        String Name,


        @NotBlank(message = "Zone_or_ZoneList_or_Space_or_SpaceList_Name is required")
        String Zone_or_ZoneList_or_Space_or_SpaceList_Name,


        @NotBlank(message = "Number_of_People_Schedule_Name is required")
        String Number_of_People_Schedule_Name,

String Number_of_People_Calculation_Method,

Double Number_of_People,

Double People_per_Floor_Area,

Double Floor_Area_per_Person,

Double Fraction_Radiant,

String Sensible_Heat_Fraction,


        @NotBlank(message = "Activity_Level_Schedule_Name is required")
        String Activity_Level_Schedule_Name,

Double Carbon_Dioxide_Generation_Rate,

String Enable_ASHRAE_55_Comfort_Warnings,

String Mean_Radiant_Temperature_Calculation_Type,

String Surface_Name_Angle_Factor_List_Name,

String Work_Efficiency_Schedule_Name,

String Clothing_Insulation_Calculation_Method,

String Clothing_Insulation_Calculation_Method_Schedule_Name,

String Clothing_Insulation_Schedule_Name,

String Air_Velocity_Schedule_Name,

String Thermal_Comfort_Model_1_Type,

String Thermal_Comfort_Model_2_Type,

String Thermal_Comfort_Model_3_Type,

String Thermal_Comfort_Model_4_Type,

String Thermal_Comfort_Model_5_Type,

String Thermal_Comfort_Model_6_Type,

String Thermal_Comfort_Model_7_Type,

String Ankle_Level_Air_Velocity_Schedule_Name,

Double Cold_Stress_Temperature_Threshold,

Double Heat_Stress_Temperature_Threshold

        ) implements IdfObjectRecord {
        }
