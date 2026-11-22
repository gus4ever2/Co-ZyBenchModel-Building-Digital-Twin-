package com.cozybench.building.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.cozybench.building.model.type.ComponentCategory;
import com.cozybench.building.model.type.ComponentDomain;

import java.util.LinkedHashMap;

/** Update payload carrying the canonical component type and IDD properties. */
public record ComponentUpdateRequest(
        @NotBlank String id,
        @NotBlank String type,
        @NotNull LinkedHashMap<String, String> properties
) {
    public ComponentUpdateRequest(String id, ComponentDomain ignoredDomain, ComponentCategory ignoredCategory,
                                  String type, LinkedHashMap<String, String> properties) {
        this(id, type, properties);
    }

    /** Legacy accessors kept for Java callers; HTTP payloads no longer contain these fields. */
    public ComponentDomain domain() {
        return ComponentDomain.CONSTRUCTIONS;
    }

    public ComponentCategory category() {
        return new com.cozybench.building.model.type.ComponentTypeRegistry().resolve(type).category();
    }
}
