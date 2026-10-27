package com.cozybench.building.dto;

/** Small option shown in an editor selector; {@code displayName} may differ from its stored name. */
public record ComponentDescriptorResponse(
        String id,
        String type,
        String name,
        String displayName,
        boolean defaultOption
) {
    /** Builds a regular selectable item whose visible label matches its stored name. */
    public ComponentDescriptorResponse(String id, String type, String name) {
        this(id, type, name, name, false);
    }
}
