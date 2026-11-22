package com.cozybench.building.service.workspace;

import com.cozybench.building.dto.ComponentUpdateRequest;
import com.cozybench.building.exception.BuildingComponentNotFoundException;
import com.cozybench.building.exception.BuildingComponentValidationException;
import com.cozybench.building.factory.ComponentFactoryResolver;
import com.cozybench.building.model.document.WorkspaceComponentDocument;
import com.cozybench.building.model.type.ComponentType;
import com.cozybench.building.model.type.ComponentTypeRegistry;
import com.cozybench.building.model.type.ComponentTypePath;
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
    public WorkspaceComponentDocument create(String ownerId, String type) {
        return importService.importDefault(ownerId, type);
    }
    public WorkspaceComponentDocument create(String ownerId, ComponentTypePath path) {
        return create(ownerId, path.type());
    }

    /** Creates a typed duplicate while preserving the source object's editable values. */
    public WorkspaceComponentDocument duplicate(String ownerId, String documentId, String requestedType) {
        WorkspaceComponentDocument source = findOwned(ownerId, documentId);
        var factory = factoryResolver.resolve(requestedType);
        ComponentType requestedComponentType = factory.type();
        if (typeRegistry.resolve(source.getType()) != requestedComponentType) {
            throw new BuildingComponentValidationException(
                    "type", "Requested duplicate type does not match the source");
        }
        var values = factory.createFromValues(source.getProperties());
        return importService.importRecord(new WorkspaceImportRequest(
                ownerId, requestedType, values, new WorkspaceImportOrigin.Duplicated()));
    }
    public WorkspaceComponentDocument duplicate(String ownerId, String documentId, ComponentTypePath path) {
        return duplicate(ownerId, documentId, path.type());
    }

    /** Validates that the update keeps its current type, then delegates persistence and dependencies. */
    public WorkspaceComponentDocument update(String ownerId, ComponentUpdateRequest request) {
        WorkspaceComponentDocument document = findOwned(ownerId, request.id());
        var factory = factoryResolver.resolve(request.type());
        ComponentType type = factory.type();
        if (typeRegistry.resolve(document.getType()) != type) {
            throw new BuildingComponentValidationException("type", "The component cannot be changed to another type");
        }
        var submittedRecord = factory.createFromValues(request.properties());
        return updateService.update(ownerId, document, type, submittedRecord);
    }

    /** Imports the selected library graph using the category/type selected by the client. */
    public LibraryImportResult addFromLibrary(
            String ownerId, String libraryId, String requestedType
    ) {
        return libraryImportService.importFromLibrary(libraryId, factoryResolver.resolve(requestedType).type(), ownerId);
    }
    public LibraryImportResult addFromLibrary(String ownerId, String libraryId, ComponentTypePath path) {
        return addFromLibrary(ownerId, libraryId, path.type());
    }

    /** Deletes one owned object through the shared reference-cleaning delete service. */
    public void delete(String ownerId, String documentId) {
        deleteService.delete(ownerId, WorkspaceDeletion.single(documentId));
    }

    /** Resolves an ID only inside the current session's workspace. */
    private WorkspaceComponentDocument findOwned(String ownerId, String documentId) {
        return repository.findByIdAndOwnerId(documentId, ownerId)
                .orElseThrow(() -> new BuildingComponentNotFoundException(
                        "Workspace component not found: " + documentId));
    }
}
