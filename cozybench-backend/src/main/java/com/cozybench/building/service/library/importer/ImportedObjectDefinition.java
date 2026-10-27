package com.cozybench.building.service.library.importer;

import java.util.LinkedHashMap;

/** Name and ordered IDD properties produced by a concrete library importer. */
record ImportedObjectDefinition(
        String requestedName,
        LinkedHashMap<String, String> properties
) { }
