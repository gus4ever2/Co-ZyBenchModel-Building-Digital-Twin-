package com.cozybench.building.service.query.strategy;

import com.cozybench.building.dto.ComponentDescriptorResponse;
import com.cozybench.building.dto.ComponentListResponse;
import com.cozybench.building.dto.ComponentResponse;
import com.cozybench.building.dto.ComponentStateResponse;
import com.cozybench.building.exception.BuildingComponentNotFoundException;
import com.cozybench.building.model.document.BaseComponentDocument;
import com.cozybench.building.model.document.BuildingLibraryObjectDocument;
import com.cozybench.building.model.document.WorkspaceComponentDocument;
import com.cozybench.building.model.type.ComponentCategory;
import com.cozybench.building.model.type.ComponentTypeRegistry;
import com.cozybench.building.model.type.PredefinedConstructionSetName;
import com.cozybench.building.repository.BuildingLibraryObjectRepository;
import com.cozybench.building.repository.WorkspaceComponentRepository;

import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

/**
 * Shared editor read flow: load the editor's choices, optional references,
 * library entries, and the selected workspace document.
 */
abstract class AbstractComponentEditorQueryStrategy implements ComponentEditorQueryStrategy {

    private final WorkspaceComponentRepository workspaceRepository;
    private final BuildingLibraryObjectRepository libraryRepository;
    private final ComponentTypeRegistry types;

    AbstractComponentEditorQueryStrategy(
            WorkspaceComponentRepository workspaceRepository,
            BuildingLibraryObjectRepository libraryRepository,
            ComponentTypeRegistry types
    ) {
        this.workspaceRepository = workspaceRepository;
        this.libraryRepository = libraryRepository;
        this.types = types;
    }

    /** Returns the category accepted by this editor's reference selectors, if any. */
    protected abstract ComponentCategory selectableCategory();

    @Override
    public final ComponentStateResponse load(String ownerId, String selectedId) {
        // Load each workspace list once; the selected object's references use the same lists.
        List<WorkspaceComponentDocument> editorComponents = workspace(ownerId, editorCategory());
        ComponentCategory referenceCategory = selectableCategory();
        List<WorkspaceComponentDocument> referenceComponents = referenceCategory == null
                ? List.of()
                : workspace(ownerId, referenceCategory);

        ComponentListResponse editorOptions = new ComponentListResponse(descriptors(editorComponents));
        ComponentListResponse libraryOptions = new ComponentListResponse(descriptors(
                libraryRepository.findByCategoryOrderByNameAsc(editorCategory().name())));
        ComponentListResponse referenceOptions = referenceCategory == null
                ? ComponentListResponse.empty()
                : new ComponentListResponse(descriptors(referenceComponents));

        return new ComponentStateResponse(
                editorOptions,
                selected(selectedId, editorComponents, referenceComponents),
                libraryOptions,
                referenceOptions
        );
    }

    /** Resolves the requested editor item and replaces known reference IDs with display names. */
    private ComponentResponse selected(
            String selectedId,
            List<WorkspaceComponentDocument> editorComponents,
            List<WorkspaceComponentDocument> referenceComponents
    ) {
        // "0" is the frontend's no-selection sentinel.
        if (selectedId == null || "0".equals(selectedId)) {
            return null;
        }

        WorkspaceComponentDocument document = editorComponents.stream()
                .filter(component -> selectedId.equals(component.getId()))
                .findFirst()
                .orElseThrow(() -> new BuildingComponentNotFoundException(
                        "Workspace component not found: " + selectedId));
        var type = types.resolve(document.getType());
        if (type.category() != editorCategory()) {
            throw new BuildingComponentNotFoundException(
                    "Workspace component does not belong to this editor");
        }

        // Only IDs in the editor and its reference list become names; other values stay unchanged.
        Map<String, String> namesById = new HashMap<>();
        Stream.concat(editorComponents.stream(), referenceComponents.stream())
                .forEach(item -> namesById.put(item.getId(), item.getName()));
        LinkedHashMap<String, String> properties = new LinkedHashMap<>(document.getProperties());
        properties.replaceAll((field, value) ->
                "Name".equals(field) || value == null ? value : namesById.getOrDefault(value, value));

        return new ComponentResponse(document.getId(), type.apiName(), properties);
    }

    /** Loads all workspace objects that the selected editor category can use. */
    private List<WorkspaceComponentDocument> workspace(String ownerId, ComponentCategory category) {
        return workspaceRepository.findAllByOwnerIdAndTypeInOrderByNameAsc(
                ownerId, types.eppyNames(category));
    }

    /** Sorts options consistently before converting documents to the editor's compact shape. */
    private List<ComponentDescriptorResponse> descriptors(
            List<? extends BaseComponentDocument> documents
    ) {
        return documents.stream()
                .sorted(Comparator.comparing(
                        BaseComponentDocument::getName,
                        String.CASE_INSENSITIVE_ORDER))
                .map(this::descriptor)
                .toList();
    }

    /** Adds a readable label for predefined construction sets without changing their stored key. */
    private ComponentDescriptorResponse descriptor(BaseComponentDocument document) {
        String apiType = document instanceof WorkspaceComponentDocument workspace
                ? workspace.getType()
                : types.apiNameOf(((BuildingLibraryObjectDocument) document).getType());

        if (document instanceof BuildingLibraryObjectDocument item
                && "CONSTRUCTION_SET".equals(item.getCategory())) {
            String displayName = PredefinedConstructionSetName.displayNameFor(document.getName());
            return new ComponentDescriptorResponse(
                    document.getId(), apiType, document.getName(), displayName, true);
        }
        return new ComponentDescriptorResponse(document.getId(), apiType, document.getName());
    }
}
