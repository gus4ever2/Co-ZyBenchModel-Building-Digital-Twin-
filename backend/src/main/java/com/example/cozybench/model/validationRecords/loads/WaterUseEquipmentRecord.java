package com.example.cozybench.model.validationRecords.loads;

        import com.example.cozybench.model.validationRecords.IdfObjectRecord;
        import jakarta.validation.constraints.NotBlank;
        import jakarta.validation.constraints.NotNull;
        import lombok.Builder;

        @Builder
        public record WaterUseEquipmentRecord(


        @NotBlank(message = "Name is required")
        String Name,

String End_Use_Subcategory,


        @NotNull(message = "Peak_Flow_Rate is required")
        Double Peak_Flow_Rate,

String Flow_Rate_Fraction_Schedule_Name,

String Target_Temperature_Schedule_Name,

String Hot_Water_Supply_Temperature_Schedule_Name,

String Cold_Water_Supply_Temperature_Schedule_Name,

String Zone_Name,

String Sensible_Fraction_Schedule_Name,

String Latent_Fraction_Schedule_Name

        ) implements IdfObjectRecord {
        }
