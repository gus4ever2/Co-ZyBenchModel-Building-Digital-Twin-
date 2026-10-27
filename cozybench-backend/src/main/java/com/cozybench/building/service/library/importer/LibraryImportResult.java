package com.cozybench.building.service.library.importer;

import com.cozybench.building.model.document.WorkspaceComponentDocument;

import java.util.List;

/** Result of one library import, including only copies newly created by this operation. */
public record LibraryImportResult(
        WorkspaceComponentDocument selected,
        List<String> createdIds
) { }
