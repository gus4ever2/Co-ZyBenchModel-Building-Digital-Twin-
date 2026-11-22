package com.cozybench.simulation.service;

import com.cozybench.building.model.document.BuildingLibraryObjectDocument;
import com.cozybench.building.model.document.WorkspaceComponentDocument;
import com.cozybench.building.model.type.ComponentTypeRegistry;
import com.cozybench.building.model.type.ComponentCategory;
import com.cozybench.building.model.type.ConstructionType;
import com.cozybench.building.idfobject.construction.ConstructionLayerProperty;
import com.cozybench.simulation.dto.ComponentSnapshot;
import com.cozybench.simulation.dto.ConstructionSetSnapshot;
import org.springframework.stereotype.Component;

import java.util.ArrayDeque;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Builds the self-contained input saved with a simulation.
 * MongoDB relationships use IDs; EnergyPlus relationships use names.
 * The snapshot contains copies, so later workspace edits do not change a run.
 */
@Component
public class LibrarySnapshotBuilder {

    /** Build the same self-contained snapshot for a user's ID-based workspace. */
    public ConstructionSetSnapshot buildWorkspace(
            String ownerId,
            String setId,
            List<WorkspaceComponentDocument> workspaceObjects,
            ComponentTypeRegistry types
    ) {
        return buildWorkspace(ownerId, setId, null, workspaceObjects, types);
    }

    /** Build the workspace snapshot with an optional display name for a predefined set. */
    public ConstructionSetSnapshot buildWorkspace(
            String ownerId,
            String setId,
            String displayName,
            List<WorkspaceComponentDocument> workspaceObjects,
            ComponentTypeRegistry types
    ) {
        if (ownerId == null || ownerId.isBlank()) {
            throw new IllegalArgumentException("Workspace owner is required");
        }
        // Adapt workspace documents to the same shape used by the library.
        // This is an in-memory copy only: nothing is added to the library.
        List<BuildingLibraryObjectDocument> objects = workspaceObjects.stream()
                .filter(object -> ownerId.equals(object.getOwnerId()))
                .<BuildingLibraryObjectDocument>map(object -> {
                    var resolvedType = types.resolve(object.getType());
                    return BuildingLibraryObjectDocument.builder()
                            .id(object.getId())
                            .name(object.getName())
                            .nameKey(object.getNameKey())
                            .type(resolvedType.apiName())
                            .properties(new LinkedHashMap<>(object.getProperties()))
                            .build();
                })
                .toList();
        return build(setId, displayName, objects);
    }

    public ConstructionSetSnapshot build(
            String setId,
            String displayName,
            List<BuildingLibraryObjectDocument> libraryObjects
    ) {
        ComponentTypeRegistry types = new ComponentTypeRegistry();
        // First make IDs easy to find; an invalid reference must fail clearly.
        Map<String, BuildingLibraryObjectDocument> byId = new LinkedHashMap<>();
        for (BuildingLibraryObjectDocument object : libraryObjects) {
            if (object.getId() == null || byId.putIfAbsent(object.getId(), object) != null) {
                throw new IllegalArgumentException("A library object has a missing or duplicate ID");
            }
        }

        BuildingLibraryObjectDocument set = require(byId, setId, "CONSTRUCTION_SET", types);
        Map<String, ComponentSnapshot> constructions = new LinkedHashMap<>();
        Map<String, ComponentSnapshot> materials = new LinkedHashMap<>();
        Map<String, String> heatSourcesByConstruction = new LinkedHashMap<>();
        ArrayDeque<String> pending = new ArrayDeque<>();
        LinkedHashMap<String, String> setProperties = new LinkedHashMap<>(set.getProperties());

        // Queue the constructions referenced by the set and translate the set
        // fields to the names that EnergyPlus will see.
        for (var field : setProperties.entrySet()) {
            if ("Name".equals(field.getKey()) || blank(field.getValue())) {
                continue;
            }
            BuildingLibraryObjectDocument construction = require(byId, field.getValue(), "CONSTRUCTION", types);
            pending.add(construction.getId());
            if (isType(construction, ConstructionType.CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE, types)) {
                // Surfaces point to the Construction; the separate property attaches to it.
                BuildingLibraryObjectDocument parent = require(
                        byId, construction.getProperties().get("Construction_Name"), "CONSTRUCTION", types
                );
                if (!isType(parent, ConstructionType.CONSTRUCTION, types)) {
                    throw new IllegalArgumentException("Internal heat source requires a layered construction");
                }
                field.setValue(parent.getName());
            } else {
                field.setValue(construction.getName());
            }
        }

        // Walk the queue once. The maps deduplicate shared constructions and
        // materials while preserving their order in the exported snapshot.
        while (!pending.isEmpty()) {
            String id = pending.removeFirst();
            if (constructions.containsKey(id)) {
                continue;
            }
            BuildingLibraryObjectDocument construction = require(byId, id, "CONSTRUCTION", types);
            LinkedHashMap<String, String> properties = new LinkedHashMap<>(construction.getProperties());
            String snapshotName = construction.getName();
            if (isType(construction, ConstructionType.CONSTRUCTION, types)) {
                for (ConstructionLayerProperty layer : ConstructionLayerProperty.values()) {
                    String field = layer.fieldName();
                    String materialId = properties.get(field);
                    if (blank(materialId)) {
                        continue;
                    }
                    BuildingLibraryObjectDocument material = require(byId, materialId, "MATERIAL", types);
                    materials.putIfAbsent(materialId, snapshot(material, material.getProperties(), types));
                    properties.put(field, material.getName());
                }
            } else if (isType(construction, ConstructionType.CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE, types)) {
                String parentId = properties.get("Construction_Name");
                BuildingLibraryObjectDocument parent = require(byId, parentId, "CONSTRUCTION", types);
                String previousSource = heatSourcesByConstruction.putIfAbsent(parentId, id);
                if (previousSource != null && !previousSource.equals(id)) {
                    throw new IllegalArgumentException("Two heat source properties would have the same generated name for: "
                            + parent.getName());
                }
                // The property needs its parent Construction as a separate
                // EnergyPlus object; the set's slot points to that parent.
                pending.add(parent.getId());
                properties.put("Construction_Name", parent.getName());
                snapshotName = parent.getName() + " Internal Heat Source";
                properties.put("Name", snapshotName);
            }
            constructions.put(id, new ComponentSnapshot(construction.getId(), snapshotName,
                    types.resolve(construction.getType()).eppyName(), nonBlankProperties(properties)));
        }

        String name = blank(displayName) ? set.getName() : displayName;
        setProperties.put("Name", name);
        ComponentSnapshot selected = new ComponentSnapshot(
                set.getId(), name, types.resolve(set.getType()).eppyName(), nonBlankProperties(setProperties)
        );
        return new ConstructionSetSnapshot(
                selected,
                List.copyOf(constructions.values()),
                List.copyOf(materials.values())
        );
    }

    private ComponentSnapshot snapshot(BuildingLibraryObjectDocument object, Map<String, String> properties, ComponentTypeRegistry types) {
        return new ComponentSnapshot(object.getId(), object.getName(), types.resolve(object.getType()).eppyName(), nonBlankProperties(properties));
    }

    private Map<String, String> nonBlankProperties(Map<String, String> properties) {
        Map<String, String> filtered = new LinkedHashMap<>();
        properties.forEach((field, value) -> {
            if (!blank(value)) filtered.put(field, value);
        });
        return filtered;
    }

    private BuildingLibraryObjectDocument require(
            Map<String, BuildingLibraryObjectDocument> byId, String id, String category, ComponentTypeRegistry types
    ) {
        BuildingLibraryObjectDocument object = byId.get(id);
        if (object == null || types.resolve(object.getType()).category() != ComponentCategory.valueOf(category)) {
            throw new IllegalArgumentException("Missing or invalid " + category + " reference: " + id);
        }
        return object;
    }

    private boolean isType(BuildingLibraryObjectDocument object, com.cozybench.building.model.type.ComponentType expected,
                           ComponentTypeRegistry types) {
        return types.resolve(object.getType()) == expected;
    }

    private boolean blank(String value) {
        return value == null || value.isBlank();
    }
}
