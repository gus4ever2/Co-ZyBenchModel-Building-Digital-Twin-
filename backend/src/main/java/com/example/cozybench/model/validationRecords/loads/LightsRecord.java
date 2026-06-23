package com.example.cozybench.model.validationRecords.loads;

        import com.example.cozybench.model.validationRecords.IdfObjectRecord;
        import jakarta.validation.constraints.NotBlank;
        import lombok.Builder;

        @Builder
        public record LightsRecord(


        @NotBlank(message = "Name is required")
        String Name,


        @NotBlank(message = "Zone_or_ZoneList_or_Space_or_SpaceList_Name is required")
        String Zone_or_ZoneList_or_Space_or_SpaceList_Name,


        @NotBlank(message = "Schedule_Name is required")
        String Schedule_Name,

String Design_Level_Calculation_Method,

Double Lighting_Level,

Double Watts_per_Zone_Floor_Area,

Double Watts_per_Person,

Double Return_Air_Fraction,

Double Fraction_Radiant,

Double Fraction_Visible,

Double Fraction_Replaceable,

String End_Use_Subcategory,

String Return_Air_Fraction_Calculated_from_Plenum_Temperature,

Double Return_Air_Fraction_Function_of_Plenum_Temperature_Coefficient_1,

Double Return_Air_Fraction_Function_of_Plenum_Temperature_Coefficient_2,

String Return_Air_Heat_Gain_Node_Name,

String Exhaust_Air_Heat_Gain_Node_Name

        ) implements IdfObjectRecord {
        }
