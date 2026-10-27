package com.cozybench.building.service.library.importer;

import com.cozybench.building.model.document.BuildingLibraryObjectDocument;

/** Public contract shared by the library importers. */
public interface LibraryObjectImporter {

    LibraryImportResult importSelectedObject(String ownerId, BuildingLibraryObjectDocument selectedSource);
}
