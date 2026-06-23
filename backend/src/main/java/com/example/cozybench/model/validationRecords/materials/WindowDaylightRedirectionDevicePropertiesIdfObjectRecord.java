package com.example.cozybench.model.validationRecords.materials;

import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import lombok.Builder;

import jakarta.validation.constraints.NotBlank;

@Builder
public record WindowDaylightRedirectionDevicePropertiesIdfObjectRecord(
        @NotBlank(message = "Name is required")
        String Name
) implements IdfObjectRecord {}
