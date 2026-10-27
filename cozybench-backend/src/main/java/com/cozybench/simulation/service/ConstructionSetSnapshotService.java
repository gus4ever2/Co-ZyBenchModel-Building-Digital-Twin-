package com.cozybench.simulation.service;

import com.cozybench.building.model.type.ComponentTypeRegistry;
import com.cozybench.building.model.type.PredefinedConstructionSetName;
import com.cozybench.building.repository.BuildingLibraryObjectRepository;
import com.cozybench.building.repository.WorkspaceComponentRepository;
import com.cozybench.building.service.naming.ComponentNameService;
import com.cozybench.building.service.library.LibraryImportService;
import com.cozybench.building.service.workspace.DeleteDocumentInWorkspaceService;
import com.cozybench.building.service.workspace.WorkspaceDeletion;
import com.cozybench.simulation.dto.ConstructionSetSnapshot;
import org.springframework.stereotype.Service;

/** Captures a selected set as a self-contained simulation snapshot. */
@Service
public class ConstructionSetSnapshotService {
    private final WorkspaceComponentRepository workspace;
    private final BuildingLibraryObjectRepository library;
    private final ComponentNameService names;
    private final ComponentTypeRegistry types;
    private final LibrarySnapshotBuilder builder;
    private final LibraryImportService libraryImports;
    private final DeleteDocumentInWorkspaceService workspaceDeletes;

    public ConstructionSetSnapshotService(WorkspaceComponentRepository workspace,
                                          BuildingLibraryObjectRepository library,
                                          ComponentNameService names,
                                          ComponentTypeRegistry types,
                                          LibrarySnapshotBuilder builder,
                                          LibraryImportService libraryImports,
                                          DeleteDocumentInWorkspaceService workspaceDeletes) {
        this.workspace = workspace;
        this.library = library;
        this.names = names;
        this.types = types;
        this.builder = builder;
        this.libraryImports = libraryImports;
        this.workspaceDeletes = workspaceDeletes;
    }

    public ConstructionSetSnapshot snapshot(String ownerId, String idOrName) {
        // Workspace choices are normally sent as IDs by the frontend.
        var personal = workspace.findByIdAndOwnerId(idOrName, ownerId);
        if (personal.isPresent()) {
            return builder.buildWorkspace(ownerId, personal.get().getId(),
                    workspace.findAllByOwnerIdOrderByNameAsc(ownerId), types);
        }

        // Library presets use the same import path as workspace Add, then their
        // self-contained snapshot is built before newly created copies are cleaned up.
        var predefined = library.findById(idOrName)
                .filter(item -> "CONSTRUCTION_SET".equals(item.getCategory()))
                .or(() -> library.findByNameKey(names.nameKey(idOrName)));
        if (predefined.isPresent() && "CONSTRUCTION_SET".equals(predefined.get().getCategory())) {
            var set = predefined.get();
            // Use the same library-import graph as the workspace Add action. The snapshot is
            // self-contained, so only objects newly created for this operation are removed.
            var imported = libraryImports.importFromLibrary(set.getId(), types.resolve(set.getType()), ownerId);
            try {
                return builder.buildWorkspace(ownerId, imported.selected().getId(),
                        PredefinedConstructionSetName.displayNameFor(set.getName()),
                        workspace.findAllByOwnerIdOrderByNameAsc(ownerId), types);
            } finally {
                if (!imported.createdIds().isEmpty()) {
                    workspaceDeletes.delete(ownerId, WorkspaceDeletion.multiple(imported.createdIds()));
                }
            }
        }

        // Also accept a workspace name for existing callers.
        var byName = workspace.findByOwnerIdAndNameKey(ownerId, names.nameKey(idOrName))
                .orElseThrow(() -> new IllegalArgumentException("Construction set was not found"));
        return builder.buildWorkspace(ownerId, byName.getId(),
                workspace.findAllByOwnerIdOrderByNameAsc(ownerId), types);
    }
}
