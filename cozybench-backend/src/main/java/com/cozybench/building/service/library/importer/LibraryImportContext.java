package com.cozybench.building.service.library.importer;

import com.cozybench.building.model.document.BuildingLibraryObjectDocument;
import com.cozybench.building.model.document.WorkspaceComponentDocument;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Mutable caches for one import operation: loaded library sources, reused workspace copies,
 * active recursion paths, and copies created for possible rollback or later cleanup.
 */
record LibraryImportContext(
        String ownerId,
        Map<String, BuildingLibraryObjectDocument> libraryObjectsById,
        Map<String, WorkspaceComponentDocument> copiesByLibraryId,
        Set<String> activeLibraryIds,
        List<WorkspaceComponentDocument> createdCopies
) {
    LibraryImportContext(String ownerId) {
        this(ownerId, new HashMap<>(), new HashMap<>(), new HashSet<>(), new ArrayList<>());
        if (ownerId == null || ownerId.isBlank()) {
            throw new IllegalArgumentException("Owner is required");
        }
    }

    /** Returns an immutable snapshot so callers can safely report created IDs. */
    List<WorkspaceComponentDocument> createdCopiesSnapshot() {
        return List.copyOf(createdCopies);
    }
}
