package com.cozybench.building.service.workspace;

import com.cozybench.building.dto.ComponentUpdateRequest;
import com.cozybench.building.exception.BuildingComponentNotFoundException;
import com.cozybench.building.exception.BuildingComponentValidationException;
import com.cozybench.building.factory.ComponentFactoryResolver;
import com.cozybench.building.model.document.WorkspaceComponentDocument;
import com.cozybench.building.model.type.ComponentType;
import com.cozybench.building.model.type.ComponentTypePath;
import com.cozybench.building.model.type.ComponentTypeRegistry;
import com.cozybench.building.repository.WorkspaceComponentRepository;
import com.cozybench.building.service.library.LibraryImportService;
import com.cozybench.building.service.library.importer.LibraryImportResult;
import org.springframework.stereotype.Service;

/** Routes workspace commands to the focused import, update, and delete services. */
@Service
public class WorkspaceComponentCoordinator {

    private final WorkspaceComponentRepository repository;
    private final ComponentTypeRegistry typeRegistry;
    private final ComponentFactoryResolver factoryResolver;
    private final ImportToWorkspaceService importService;
    private final UpdateDocumentInWorkspaceService updateService;
    private final DeleteDocumentInWorkspaceService deleteService;
    private final LibraryImportService libraryImportService;

    public WorkspaceComponentCoordinator(
            WorkspaceComponentRepository repository,
            ComponentTypeRegistry typeRegistry,
            ComponentFactoryResolver factoryResolver,
            ImportToWorkspaceService importService,
            UpdateDocumentInWorkspaceService updateService,
            DeleteDocumentInWorkspaceService deleteService,
            LibraryImportService libraryImportService
    ) {
        this.repository = repository;
        this.typeRegistry = typeRegistry;
        this.factoryResolver = factoryResolver;
        this.importService = importService;
        this.updateService = updateService;
        this.deleteService = deleteService;
        this.libraryImportService = libraryImportService;
    }

    /** Builds a default IDD record and persists it as a new workspace object. */
    public WorkspaceComponentDocument create(String ownerId, ComponentTypePath path) {
        return importService.importDefault(ownerId, path);
    }

    /** Creates a typed duplicate while preserving the source object's editable values. */
    public WorkspaceComponentDocument duplicate(String ownerId, String documentId, ComponentTypePath path) {
        WorkspaceComponentDocument source = findOwned(ownerId, documentId);
        var factory = factoryResolver.resolve(path);
        ComponentType requestedType = factory.type();
        if (typeRegistry.resolve(source.getType()) != requestedType) {
            throw new BuildingComponentValidationException(
                    "type", "Requested duplicate type does not match the source");
        }
        var values = factory.createFromValues(source.getProperties());
        return importService.importRecord(new WorkspaceImportRequest(
                ownerId, path, values, new WorkspaceImportOrigin.Duplicated()));
    }

    /** Validates that the update keeps its current type, then delegates persistence and dependencies. */
    public WorkspaceComponentDocument update(String ownerId, ComponentUpdateRequest request) {
        WorkspaceComponentDocument document = findOwned(ownerId, request.id());
        ComponentTypePath path = new ComponentTypePath(request.domain(), request.category(), request.type());
        var factory = factoryResolver.resolve(path);
        ComponentType type = factory.type();
        if (typeRegistry.resolve(document.getType()) != type) {
            throw new BuildingComponentValidationException("type", "The component cannot be changed to another type");
        }
        var submittedRecord = factory.createFromValues(request.properties());
        return updateService.update(ownerId, document, path, type, submittedRecord);
    }

    /** Imports the selected library graph using the category/type selected by the client. */
    public LibraryImportResult addFromLibrary(
            String ownerId, String libraryId, ComponentTypePath path
    ) {
        return libraryImportService.importFromLibrary(libraryId, factoryResolver.resolve(path).type(), ownerId);
    }

    /** Deletes one owned object through the shared reference-cleaning delete service. */
    public void delete(String ownerId, String documentId) {
        deleteService.delete(ownerId, WorkspaceDeletion.single(documentId));
    }

    /** Resolves an ID only inside the authenticated user's workspace. */
    private WorkspaceComponentDocument findOwned(String ownerId, String documentId) {
        return repository.findByIdAndOwnerId(documentId, ownerId)
                .orElseThrow(() -> new BuildingComponentNotFoundException(
                        "Workspace component not found: " + documentId));
    }
}
