package com.cozybench.building.service.workspace;

import com.cozybench.building.model.validation.IddPropertiesRecord;
import com.cozybench.building.model.type.ComponentDomain;
import com.cozybench.building.model.type.ComponentTypePath;
import com.cozybench.building.model.type.ComponentTypeRegistry;

/** Fully typed input for writing one IDD record into a user's workspace. */
public record WorkspaceImportRequest(
        String ownerId,
        String type,
        IddPropertiesRecord component,
        WorkspaceImportOrigin origin
) {
    public WorkspaceImportRequest(String ownerId, ComponentTypePath path,
                                  IddPropertiesRecord component, WorkspaceImportOrigin origin) {
        this(ownerId, path.type(), component, origin);
    }

    /** Legacy view retained for non-HTTP callers while the persisted/API contract is type-only. */
    public ComponentTypePath typePath() {
        var resolved = new ComponentTypeRegistry().resolve(type);
        return new ComponentTypePath(ComponentDomain.CONSTRUCTIONS, resolved.category(), resolved.apiName());
    }

    public WorkspaceImportRequest {
        if (ownerId == null || ownerId.isBlank()) {
            throw new IllegalArgumentException("Workspace owner is required");
        }
        if (type == null || type.isBlank() || component == null || origin == null) {
            throw new IllegalArgumentException("Type, component record, and import origin are required");
        }
    }
}
