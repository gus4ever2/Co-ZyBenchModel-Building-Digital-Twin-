package com.cozybench.building.service.library;

import com.cozybench.building.exception.BuildingComponentNotFoundException;
import com.cozybench.building.model.type.ComponentType;
import com.cozybench.building.model.type.ComponentTypeRegistry;
import com.cozybench.building.repository.BuildingLibraryObjectRepository;
import com.cozybench.building.service.library.importer.ConstructionImporter;
import com.cozybench.building.service.library.importer.ConstructionSetImporter;
import com.cozybench.building.service.library.importer.LibraryImportResult;
import com.cozybench.building.service.library.importer.MaterialImporter;
import org.springframework.stereotype.Service;

/** Imports a library object and its dependencies into one user's workspace. */
@Service
public class LibraryImportService {
    private final BuildingLibraryObjectRepository library;
    private final ComponentTypeRegistry types;
    private final MaterialImporter materials;
    private final ConstructionImporter constructions;
    private final ConstructionSetImporter constructionSets;

    public LibraryImportService(
            BuildingLibraryObjectRepository library,
            ComponentTypeRegistry types,
            MaterialImporter materials,
            ConstructionImporter constructions,
            ConstructionSetImporter constructionSets
    ) {
        this.library = library;
        this.types = types;
        this.materials = materials;
        this.constructions = constructions;
        this.constructionSets = constructionSets;
    }

    /** Loads the selected library object and starts its type-specific importer. */
    public LibraryImportResult importFromLibrary(
            String libraryId,
            ComponentType requestedType,
            String ownerId
    ) {
        var source = library.findById(libraryId).orElseThrow(() ->
                new BuildingComponentNotFoundException("Library object not found: " + libraryId));
        if (types.resolve(source.getType()) != requestedType) {
            throw new IllegalArgumentException("Library object type does not match the requested type");
        }
        // The selected family chooses its importer explicitly. Child importers
        // call the importer for the dependency type they already know.
        return switch (requestedType.category()) {
            case MATERIAL -> materials.importSelectedObject(ownerId, source);
            case CONSTRUCTION -> constructions.importSelectedObject(ownerId, source);
            case CONSTRUCTION_SET -> constructionSets.importSelectedObject(ownerId, source);
        };
    }

}
