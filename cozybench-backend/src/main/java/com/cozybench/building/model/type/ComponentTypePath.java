package com.cozybench.building.model.type;

/**
 * The explicit backend selection path for a component. UI tabs are not part of
 * this value because they are presentation state rather than domain data.
 */
public record ComponentTypePath(
        /** Top-level feature area, used to reject categories outside this domain. */
        ComponentDomain domain,
        /** Component family, used to select the factory and valid type enum. */
        ComponentCategory category,
        /** Public API name of the concrete EnergyPlus object type. */
        String type
) {
    public ComponentTypePath {
        if (domain == null || category == null || type == null || type.isBlank()) {
            throw new IllegalArgumentException("Domain, category, and type are required");
        }
    }
}
