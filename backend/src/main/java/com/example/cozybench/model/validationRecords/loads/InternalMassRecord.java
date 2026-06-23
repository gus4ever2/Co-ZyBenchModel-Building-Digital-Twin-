package com.example.cozybench.model.validationRecords.loads;

        import com.example.cozybench.model.validationRecords.IdfObjectRecord;
        import jakarta.validation.constraints.NotBlank;
        import jakarta.validation.constraints.NotNull;
        import lombok.Builder;

        @Builder
        public record InternalMassRecord(


        @NotBlank(message = "Name is required")
        String Name,


        @NotBlank(message = "Construction_Name is required")
        String Construction_Name,


        @NotBlank(message = "Zone_or_ZoneList_Name is required")
        String Zone_or_ZoneList_Name,

String Space_or_SpaceList_Name,


        @NotNull(message = "Surface_Area is required")
        Double Surface_Area

        ) implements IdfObjectRecord {
        }
