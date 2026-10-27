package com.cozybench.building.service.workspace;

import com.cozybench.building.exception.BuildingComponentNotFoundException;
import com.cozybench.building.idfobject.construction.ConstructionLayerProperty;
import com.cozybench.building.idfobject.construction.InternalHeatSourceProperty;
import com.cozybench.building.idfobject.constructionset.ConstructionSetProperty;
import com.cozybench.building.model.document.WorkspaceComponentDocument;
import com.cozybench.building.model.type.ComponentType;
import com.cozybench.building.model.type.ComponentTypeRegistry;
import com.cozybench.building.model.type.ConstructionSetType;
import com.cozybench.building.model.type.ConstructionType;
import com.cozybench.building.repository.WorkspaceComponentRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Deletes workspace documents without leaving known ID references behind.
 * Dependants are retained, updated, and marked as modified rather than deleted.
 */
@Service
public class DeleteDocumentInWorkspaceService {

    private final WorkspaceComponentRepository repository;
    private final ComponentTypeRegistry typeRegistry;

    public DeleteDocumentInWorkspaceService(
            WorkspaceComponentRepository repository,
            ComponentTypeRegistry typeRegistry
    ) {
        this.repository = repository;
        this.typeRegistry = typeRegistry;
    }

    /** Deletes one document through the same cleanup path used for rollback batches. */
    public void delete(String ownerId, String documentId) {
        delete(ownerId, WorkspaceDeletion.single(documentId));
    }

    /** Routes one-item deletion and temporary batch cleanup through the same owner-scoped flow. */
    public void delete(String ownerId, WorkspaceDeletion deletion) {
        for (String documentId : deletion.documentIds()) {
            deleteOne(ownerId, documentId);
        }
    }

    /** Cleans references to one target, then removes that target from the owner's workspace. */
    private void deleteOne(String ownerId, String documentId) {
        // The owner filter prevents a request from deleting another user's document.
        WorkspaceComponentDocument document = repository.findByIdAndOwnerId(documentId, ownerId)
                .orElseThrow(() -> new BuildingComponentNotFoundException(
                        "Workspace component not found: " + documentId));
        var documents = repository.findAllByOwnerIdOrderByNameAsc(ownerId);
        var changed = removeReferencesAndMarkDependants(ownerId, documentId, documents);

        // Save cleaned references before removing the target, so no stored document keeps its old ID.
        if (!changed.isEmpty()) {
            repository.saveAll(changed);
        }
        repository.delete(document);
    }

    /**
     * Walks direct and indirect dependants. Clearing a referenced construction can itself
     * affect a construction set or an internal heat source, so each changed ID is checked next.
     */
    private List<WorkspaceComponentDocument> removeReferencesAndMarkDependants(
            String ownerId, String removedId, List<WorkspaceComponentDocument> documents
    ) {
        Set<String> visited = new LinkedHashSet<>();
        Set<WorkspaceComponentDocument> changed = new LinkedHashSet<>();
        ArrayDeque<String> pending = new ArrayDeque<>();
        pending.add(removedId);
        visited.add(removedId);

        while (!pending.isEmpty()) {
            String targetId = pending.removeFirst();
            for (WorkspaceComponentDocument candidate : documents) {
                if (!ownerId.equals(candidate.getOwnerId()) || targetId.equals(candidate.getId())) continue;
                List<String> matchingFields = matchingReferenceFields(candidate, targetId);
                if (matchingFields.isEmpty()) continue;

                // Layered constructions require compact layer slots; other objects can clear the field.
                if (isLayeredConstruction(candidate)) {
                    compactConstructionLayers(candidate, targetId);
                } else {
                    matchingFields.forEach(field -> candidate.getProperties().put(field, ""));
                }
                candidate.setModified(true);
                changed.add(candidate);
                // Follow the dependency chain while visited prevents accidental loops.
                if (candidate.getId() != null && visited.add(candidate.getId())) {
                    pending.addLast(candidate.getId());
                }
            }
        }
        return List.copyOf(changed);
    }

    /** Finds reference fields from the explicit construction and construction-set property enums. */
    private List<String> matchingReferenceFields(WorkspaceComponentDocument document, String targetId) {
        ComponentType type;
        try {
            type = typeRegistry.resolve(document.getType());
        } catch (IllegalArgumentException ignored) {
            // Unknown legacy types cannot safely be interpreted as one of the known reference shapes.
            return List.of();
        }
        if (type == ConstructionType.CONSTRUCTION) {
            return java.util.Arrays.stream(ConstructionLayerProperty.values())
                    .map(ConstructionLayerProperty::fieldName)
                    .filter(field -> targetId.equals(document.getProperties().get(field)))
                    .toList();
        }
        if (type == ConstructionType.CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE) {
            String field = InternalHeatSourceProperty.CONSTRUCTION_NAME.fieldName();
            return targetId.equals(document.getProperties().get(field)) ? List.of(field) : List.of();
        }
        if (type == ConstructionSetType.CONSTRUCTION_SET) {
            return java.util.Arrays.stream(ConstructionSetProperty.values())
                    .map(ConstructionSetProperty::fieldName)
                    .filter(field -> targetId.equals(document.getProperties().get(field)))
                    .toList();
        }
        return List.of();
    }

    /** Identifies constructions whose material slots must stay contiguous after a removal. */
    private boolean isLayeredConstruction(WorkspaceComponentDocument document) {
        return typeRegistry.resolve(document.getType()) == ConstructionType.CONSTRUCTION;
    }

    /** Removes one material ID and shifts the remaining layers toward the outside layer. */
    private void compactConstructionLayers(WorkspaceComponentDocument construction, String removedId) {
        List<String> remainingMaterials = new ArrayList<>();
        // Preserve the existing outside-to-inside order while removing the deleted material.
        for (ConstructionLayerProperty layer : ConstructionLayerProperty.values()) {
            String materialId = construction.getProperties().get(layer.fieldName());
            if (materialId != null && !materialId.isBlank() && !removedId.equals(materialId)) {
                remainingMaterials.add(materialId);
            }
        }
        int index = 0;
        for (ConstructionLayerProperty layer : ConstructionLayerProperty.values()) {
            if (construction.getProperties().containsKey(layer.fieldName()) || index < remainingMaterials.size()) {
                construction.getProperties().put(
                        layer.fieldName(), index < remainingMaterials.size() ? remainingMaterials.get(index) : "");
            }
            index++;
        }
    }
}
