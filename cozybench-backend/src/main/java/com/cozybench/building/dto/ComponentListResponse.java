package com.cozybench.building.dto;

import java.util.List;

/** Immutable list of selectable component descriptors. */
public record ComponentListResponse(
        List<ComponentDescriptorResponse> componentParts
) {
    public ComponentListResponse {
        // Prevent callers from changing the response after it has been created.
        componentParts = List.copyOf(componentParts);
    }

    /** Returns a valid empty selector response when a category has no available objects. */
    public static ComponentListResponse empty() {
        return new ComponentListResponse(List.of());
    }
}
