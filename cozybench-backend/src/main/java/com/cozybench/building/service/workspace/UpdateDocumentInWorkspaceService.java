package com.cozybench.building.service.workspace;

import com.cozybench.building.exception.BuildingComponentValidationException;
import com.cozybench.building.idfobject.construction.ConstructionLayerProperty;
import com.cozybench.building.idfobject.construction.InternalHeatSourceProperty;
import com.cozybench.building.idfobject.constructionset.ConstructionSetProperty;
import com.cozybench.building.model.document.WorkspaceComponentDocument;
import com.cozybench.building.model.type.ComponentType;
import com.cozybench.building.model.type.ComponentTypePath;
import com.cozybench.building.model.type.ComponentTypeRegistry;
import com.cozybench.building.model.type.ConstructionSetType;
import com.cozybench.building.model.type.ConstructionType;
import com.cozybench.building.model.validation.IddPropertiesRecord;
import com.cozybench.building.repository.WorkspaceComponentRepository;
import com.cozybench.building.service.naming.ComponentNameService;
import org.springframework.stereotype.Service;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/** Updates one workspace document and marks its full dependant chain as modified. */
@Service
public class UpdateDocumentInWorkspaceService {

    private final WorkspaceComponentRepository repository;
    private final ComponentNameService nameService;
    private final ComponentTypeRegistry typeRegistry;
    private final ImportToWorkspaceService importService;

    public UpdateDocumentInWorkspaceService(
            WorkspaceComponentRepository repository,
            ComponentNameService nameService,
            ComponentTypeRegistry typeRegistry,
            ImportToWorkspaceService importService
    ) {
        this.repository = repository;
        this.nameService = nameService;
        this.typeRegistry = typeRegistry;
        this.importService = importService;
    }

    /** Applies validated values to a document already selected by the workspace coordinator. */
    public WorkspaceComponentDocument update(
            String ownerId,
            WorkspaceComponentDocument document,
            ComponentTypePath path,
            ComponentType type,
            IddPropertiesRecord submittedRecord
    ) {
        LinkedHashMap<String, String> submitted = submittedRecord.toProperties();
        String requestedName = submitted.get("Name");
        if (type == ConstructionType.CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE) {
            requestedName = nameFromConstruction(ownerId, submitted);
        }
        String validName = nameService.uniqueName(requestedName, ownerId, document.getId());
        if (type == ConstructionType.CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE
                && !validName.equals(requestedName)) {
            throw new BuildingComponentValidationException(
                    InternalHeatSourceProperty.CONSTRUCTION_NAME.fieldName(),
                    "This construction already has a heat source or its generated name is in use");
        }
        submitted.put("Name", validName);

        // Resolve editable names or IDs to workspace IDs before storing any reference fields.
        LinkedHashMap<String, String> normalized = submitted;
        importService.normalizeLinkedProperties(ownerId, type, normalized);

        // The same owner snapshot lets this operation rename related objects and mark dependants.
        List<WorkspaceComponentDocument> ownedDocuments = repository.findAllByOwnerIdOrderByNameAsc(ownerId);
        var renamedHeatSources = renameDependentHeatSources(
                ownerId, document, type, validName, ownedDocuments);

        document.setName(validName);
        document.setNameKey(nameService.nameKey(validName));
        document.setDomain(path.domain().name());
        document.setCategory(path.category().name());
        document.setType(type.apiName());
        document.setEpiName(type.eppyName());
        document.setProperties(normalized);
        document.setModified(true);
        WorkspaceComponentDocument saved = repository.save(document);

        if (!renamedHeatSources.isEmpty()) {
            repository.saveAll(renamedHeatSources);
        }
        var dependants = markDependantsModified(ownerId, document.getId(), ownedDocuments);
        if (!dependants.isEmpty()) {
            repository.saveAll(dependants);
        }
        return saved;
    }

    /** Derives the heat-source name from its selected parent construction. */
    private String nameFromConstruction(String ownerId, LinkedHashMap<String, String> properties) {
        String constructionField = InternalHeatSourceProperty.CONSTRUCTION_NAME.fieldName();
        String constructionReference = properties.get(constructionField);
        if (constructionReference == null || constructionReference.isBlank()) {
            throw new BuildingComponentValidationException(constructionField, "A construction must be selected");
        }
        WorkspaceComponentDocument parent = repository
                .findByIdAndOwnerId(constructionReference, ownerId)
                .or(() -> repository.findByOwnerIdAndNameKey(
                        ownerId, nameService.nameKey(constructionReference)))
                .orElseThrow(() -> new BuildingComponentValidationException(
                        constructionField, "Referenced workspace construction was not found"));
        return parent.getName() + " Internal Heat Source";
    }

    /** Keeps generated heat-source names synchronized when their parent is renamed. */
    /** Finds heat sources linked by construction ID and keeps their generated names in sync. */
    private ArrayList<WorkspaceComponentDocument> renameDependentHeatSources(
            String ownerId,
            WorkspaceComponentDocument construction,
            ComponentType type,
            String newConstructionName,
            List<WorkspaceComponentDocument> ownerDocuments
    ) {
        var renamed = new ArrayList<WorkspaceComponentDocument>();
        if (type != ConstructionType.CONSTRUCTION || newConstructionName.equals(construction.getName())) {
            return renamed;
        }

        for (WorkspaceComponentDocument dependant : ownerDocuments) {
            String constructionField = InternalHeatSourceProperty.CONSTRUCTION_NAME.fieldName();
            if (!construction.getId().equals(dependant.getProperties().get(constructionField))) {
                continue;
            }
            if (!isInternalHeatSource(dependant)) {
                continue;
            }
            String sourceName = newConstructionName + " Internal Heat Source";
            if (!nameService.uniqueName(sourceName, ownerId, dependant.getId()).equals(sourceName)) {
                throw new BuildingComponentValidationException(
                        "Name", "The heat source's generated name is already in use");
            }
            dependant.setName(sourceName);
            dependant.setNameKey(nameService.nameKey(sourceName));
            dependant.setDomain(construction.getDomain());
            dependant.setCategory(ConstructionType.CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE.category().name());
            dependant.setType(ConstructionType.CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE.apiName());
            dependant.setEpiName(ConstructionType.CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE.eppyName());
            dependant.getProperties().put("Name", sourceName);
            dependant.setModified(true);
            renamed.add(dependant);
        }
        return renamed;
    }

    /** Accepts API, IDD, or legacy type metadata for existing workspace documents. */
    /** Supports current API type names and older documents that stored the IDD name. */
    private boolean isInternalHeatSource(WorkspaceComponentDocument document) {
        ConstructionType type = ConstructionType.CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE;
        return type.apiName().equalsIgnoreCase(document.getType())
                || type.eppyName().equalsIgnoreCase(document.getType())
                || type.eppyName().equalsIgnoreCase(document.getEpiName());
    }

    /**
     * Walks references from the changed ID outward, marking every direct and indirect
     * dependant. The queue keeps the traversal iterative and the visited set avoids cycles.
     */
    private List<WorkspaceComponentDocument> markDependantsModified(
            String ownerId, String changedId, List<WorkspaceComponentDocument> documents
    ) {
        Set<String> visited = new LinkedHashSet<>();
        Set<WorkspaceComponentDocument> changed = new LinkedHashSet<>();
        ArrayDeque<String> pending = new ArrayDeque<>();
        pending.add(changedId);
        visited.add(changedId);
        while (!pending.isEmpty()) {
            String targetId = pending.removeFirst();
            for (WorkspaceComponentDocument candidate : documents) {
                if (!ownerId.equals(candidate.getOwnerId()) || candidate.getId() == null
                        || !references(candidate, targetId)) continue;
                candidate.setModified(true);
                changed.add(candidate);
                if (visited.add(candidate.getId())) pending.addLast(candidate.getId());
            }
        }
        return List.copyOf(changed);
    }

    /** Checks only typed fields that are defined as workspace-object references. */
    /** Checks the typed reference fields that can make this document depend on the changed ID. */
    private boolean references(WorkspaceComponentDocument document, String targetId) {
        ComponentType targetType;
        try {
            targetType = typeRegistry.resolve(document.getType());
        } catch (IllegalArgumentException ignored) {
            return false;
        }
        if (targetType == ConstructionType.CONSTRUCTION) {
            return java.util.Arrays.stream(ConstructionLayerProperty.values())
                    .anyMatch(field -> targetId.equals(document.getProperties().get(field.fieldName())));
        }
        if (targetType == ConstructionType.CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE) {
            return targetId.equals(document.getProperties()
                    .get(InternalHeatSourceProperty.CONSTRUCTION_NAME.fieldName()));
        }
        if (targetType == ConstructionSetType.CONSTRUCTION_SET) {
            return java.util.Arrays.stream(ConstructionSetProperty.values())
                    .anyMatch(field -> targetId.equals(document.getProperties().get(field.fieldName())));
        }
        return false;
    }
}
