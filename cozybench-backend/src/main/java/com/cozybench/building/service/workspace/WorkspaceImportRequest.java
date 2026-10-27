package com.cozybench.building.service.workspace;

import com.cozybench.building.model.type.ComponentTypePath;
import com.cozybench.building.model.validation.IddPropertiesRecord;

/** Fully typed input for writing one IDD record into a user's workspace. */
public record WorkspaceImportRequest(
        String ownerId,
        ComponentTypePath typePath,
        IddPropertiesRecord component,
        WorkspaceImportOrigin origin
) {
    public WorkspaceImportRequest {
        if (ownerId == null || ownerId.isBlank()) {
            throw new IllegalArgumentException("Workspace owner is required");
        }
        if (typePath == null || component == null || origin == null) {
            throw new IllegalArgumentException("Type path, component record, and import origin are required");
        }
    }
}
