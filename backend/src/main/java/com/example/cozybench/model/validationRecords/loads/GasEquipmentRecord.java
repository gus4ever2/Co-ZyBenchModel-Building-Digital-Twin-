package com.example.cozybench.model.validationRecords.loads;

        import com.example.cozybench.model.validationRecords.IdfObjectRecord;
        import jakarta.validation.constraints.NotBlank;
        import lombok.Builder;

        @Builder
        public record GasEquipmentRecord(


        @NotBlank(message = "Name is required")
        String Name,


        @NotBlank(message = "Zone_or_ZoneList_or_Space_or_SpaceList_Name is required")
        String Zone_or_ZoneList_or_Space_or_SpaceList_Name,


        @NotBlank(message = "Schedule_Name is required")
        String Schedule_Name,

String Design_Level_Calculation_Method,

Double Design_Level,

Double Power_per_Zone_Floor_Area,

Double Power_per_Person,

Double Fraction_Latent,

Double Fraction_Radiant,

Double Fraction_Lost,

Double Carbon_Dioxide_Generation_Rate,

String End_Use_Subcategory

        ) implements IdfObjectRecord {
        }
