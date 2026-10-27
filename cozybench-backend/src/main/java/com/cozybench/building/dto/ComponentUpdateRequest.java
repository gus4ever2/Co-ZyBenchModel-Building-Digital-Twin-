package com.cozybench.building.dto;

import com.cozybench.building.model.type.ComponentCategory;
import com.cozybench.building.model.type.ComponentDomain;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.LinkedHashMap;

/** Update payload carrying an explicit component path and properties for its IDD record. */
public record ComponentUpdateRequest(
        @NotBlank String id,
        @NotNull ComponentDomain domain,
        @NotNull ComponentCategory category,
        @NotBlank String type,
        @NotNull LinkedHashMap<String, String> properties
) {
}
