package com.cozybench.building.service.library.importer;

import com.cozybench.building.factory.ComponentFactoryResolver;
import com.cozybench.building.model.document.BuildingLibraryObjectDocument;
import com.cozybench.building.model.document.WorkspaceComponentDocument;
import com.cozybench.building.model.type.ComponentCategory;
import com.cozybench.building.model.type.ComponentDomain;
import com.cozybench.building.model.type.ComponentType;
import com.cozybench.building.model.type.ComponentTypePath;
import com.cozybench.building.model.type.ComponentTypeRegistry;
import com.cozybench.building.repository.BuildingLibraryObjectRepository;
import com.cozybench.building.repository.WorkspaceComponentRepository;
import com.cozybench.building.service.workspace.DeleteDocumentInWorkspaceService;
import com.cozybench.building.service.workspace.ImportToWorkspaceService;
import com.cozybench.building.service.workspace.WorkspaceDeletion;
import com.cozybench.building.service.workspace.WorkspaceImportOrigin;
import com.cozybench.building.service.workspace.WorkspaceImportRequest;

import java.util.LinkedHashMap;

/**
 * Shared template for importing a selected library object and its dependency graph.
 * Concrete importers provide only the object-specific property transformation.
 */
public abstract class AbstractLibraryObjectImporter implements LibraryObjectImporter {

    private final BuildingLibraryObjectRepository libraryRepository;
    private final WorkspaceComponentRepository workspaceRepository;
    private final ImportToWorkspaceService importToWorkspace;
    private final ComponentFactoryResolver factoryResolver;
    private final ComponentTypeRegistry typeRegistry;
    private final DeleteDocumentInWorkspaceService workspaceDeletes;

    protected AbstractLibraryObjectImporter(
            BuildingLibraryObjectRepository libraryRepository,
            WorkspaceComponentRepository workspaceRepository,
            ImportToWorkspaceService importToWorkspace,
            ComponentFactoryResolver factoryResolver,
            ComponentTypeRegistry typeRegistry,
            DeleteDocumentInWorkspaceService workspaceDeletes
    ) {
        this.libraryRepository = libraryRepository;
        this.workspaceRepository = workspaceRepository;
        this.importToWorkspace = importToWorkspace;
        this.factoryResolver = factoryResolver;
        this.typeRegistry = typeRegistry;
        this.workspaceDeletes = workspaceDeletes;
    }

    /** Starts an isolated import and rolls back its newly created copies on failure. */
    @Override
    public final LibraryImportResult importSelectedObject(
            String ownerId,
            BuildingLibraryObjectDocument selectedSource
    ) {
        LibraryImportContext context = new LibraryImportContext(ownerId);
        context.libraryObjectsById().put(selectedSource.getId(), selectedSource);
        try {
            WorkspaceComponentDocument selected = importLibraryObject(selectedSource, context);
            return new LibraryImportResult(selected, context.createdCopiesSnapshot().stream()
                    .map(WorkspaceComponentDocument::getId).toList());
        } catch (RuntimeException exception) {
            rollbackCreatedCopies(context, exception);
            throw exception;
        }
    }

    /** Imports one node, reusing existing copies and avoiding repeated graph work. */
    protected final WorkspaceComponentDocument importLibraryObject(
            BuildingLibraryObjectDocument source,
            LibraryImportContext context
    ) {
        WorkspaceComponentDocument alreadyImported = context.copiesByLibraryId().get(source.getId());
        if (alreadyImported != null) return alreadyImported;

        WorkspaceComponentDocument reusable = workspaceRepository
                .findByOwnerIdAndSourceLibraryIdAndModifiedFalse(context.ownerId(), source.getId())
                .orElse(null);
        if (reusable != null) {
            context.copiesByLibraryId().put(source.getId(), reusable);
            return reusable;
        }

        if (!context.activeLibraryIds().add(source.getId())) {
            throw new IllegalArgumentException("Circular library reference: " + source.getId());
        }
        try {
            ComponentType type = typeRegistry.resolve(source.getType());
            ImportedObjectDefinition definition = createDefinition(source, context);
            LinkedHashMap<String, String> properties = new LinkedHashMap<>(definition.properties());
            properties.put("Name", definition.requestedName());
            var record = factoryResolver.resolve(type).createFromValues(properties);
            WorkspaceComponentDocument copy = importToWorkspace.importRecord(
                    new WorkspaceImportRequest(
                            context.ownerId(),
                            new ComponentTypePath(ComponentDomain.CONSTRUCTIONS, type.category(), type.apiName()),
                            record,
                            new WorkspaceImportOrigin.LibraryCopy(source.getId())
                    ));
            context.copiesByLibraryId().put(source.getId(), copy);
            context.createdCopies().add(copy);
            return copy;
        } finally {
            context.activeLibraryIds().remove(source.getId());
        }
    }

    /** Imports a dependency through the importer that knows its category. */
    protected final WorkspaceComponentDocument importDependency(
            String libraryId,
            ComponentCategory expectedCategory,
            AbstractLibraryObjectImporter dependencyImporter,
            LibraryImportContext context
    ) {
        BuildingLibraryObjectDocument source = requireLibraryObject(libraryId, expectedCategory, context);
        return dependencyImporter.importLibraryObject(source, context);
    }

    /** Resolves a library document's stored EnergyPlus/API type to its enum identity. */
    protected final ComponentType typeOf(BuildingLibraryObjectDocument source) {
        return typeRegistry.resolve(source.getType());
    }

    /** Resolves the type saved on a workspace copy for subtype-specific checks. */
    protected final ComponentType typeOf(WorkspaceComponentDocument document) {
        return typeRegistry.resolve(document.getType());
    }

    /** Rewrites object-specific reference IDs and selects the name before the shared save flow. */
    protected abstract ImportedObjectDefinition createDefinition(
            BuildingLibraryObjectDocument source,
            LibraryImportContext context
    );

    /** Loads a referenced library object once per operation and verifies its expected category. */
    private BuildingLibraryObjectDocument requireLibraryObject(
            String id,
            ComponentCategory expectedCategory,
            LibraryImportContext context
    ) {
        if (id == null || id.isBlank()) throw new IllegalArgumentException("Library reference is required");
        BuildingLibraryObjectDocument source = context.libraryObjectsById().computeIfAbsent(id, key ->
                libraryRepository.findById(key).orElseThrow(() ->
                        new IllegalArgumentException("Missing library reference: " + key)));
        if (typeRegistry.resolve(source.getType()).category() != expectedCategory) {
            throw new IllegalArgumentException("Invalid library reference category: " + id);
        }
        return source;
    }

    /** Removes only copies created by this import, preserving reusable pre-existing copies. */
    private void rollbackCreatedCopies(LibraryImportContext context, RuntimeException failure) {
        var ids = context.createdCopies().stream().map(WorkspaceComponentDocument::getId).toList();
        if (ids.isEmpty()) return;
        try {
            workspaceDeletes.delete(context.ownerId(), WorkspaceDeletion.multiple(ids));
        } catch (RuntimeException rollbackFailure) {
            failure.addSuppressed(rollbackFailure);
        }
    }
}
