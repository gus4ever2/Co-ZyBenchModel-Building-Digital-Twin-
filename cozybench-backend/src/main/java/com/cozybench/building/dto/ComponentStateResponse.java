package com.cozybench.building.dto;

/** Complete read model for the editor's workspace, selected item, library, and selectable references. */
public record ComponentStateResponse(
        ComponentListResponse componentDescriptions,
        ComponentResponse component,
        ComponentListResponse libraryDescriptions,
        ComponentListResponse selectableComponentDescriptions
) {
}
