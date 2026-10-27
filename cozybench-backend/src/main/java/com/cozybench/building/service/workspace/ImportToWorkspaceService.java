package com.cozybench.building.service.workspace;

import com.cozybench.building.exception.BuildingComponentValidationException;
import com.cozybench.building.factory.ComponentFactory;
import com.cozybench.building.factory.ComponentFactoryResolver;
import com.cozybench.building.idfobject.construction.ConstructionLayerProperty;
import com.cozybench.building.idfobject.construction.InternalHeatSourceProperty;
import com.cozybench.building.idfobject.constructionset.ConstructionSetProperty;
import com.cozybench.building.model.document.WorkspaceComponentDocument;
import com.cozybench.building.model.type.ComponentCategory;
import com.cozybench.building.model.type.ComponentType;
import com.cozybench.building.model.type.ComponentTypePath;
import com.cozybench.building.model.type.ComponentTypeRegistry;
import com.cozybench.building.model.type.ConstructionSetType;
import com.cozybench.building.model.type.ConstructionType;
import com.cozybench.building.model.type.MaterialType;
import com.cozybench.building.model.validation.IddPropertiesRecord;
import com.cozybench.building.repository.WorkspaceComponentRepository;
import com.cozybench.building.service.naming.ComponentNameService;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

/** Applies common naming, validation, provenance, and persistence for workspace imports. */
@Service
public class ImportToWorkspaceService {

    private final WorkspaceComponentRepository repository;
    private final ComponentFactoryResolver factoryResolver;
    private final ComponentNameService nameService;
    private final ComponentTypeRegistry typeRegistry;

    public ImportToWorkspaceService(
            WorkspaceComponentRepository repository,
            ComponentFactoryResolver factoryResolver,
            ComponentNameService nameService,
            ComponentTypeRegistry typeRegistry
    ) {
        this.repository = repository;
        this.factoryResolver = factoryResolver;
        this.nameService = nameService;
        this.typeRegistry = typeRegistry;
    }

    /** Writes a typed record after applying the metadata associated with its origin. */
    public WorkspaceComponentDocument importRecord(WorkspaceImportRequest request) {
        ComponentFactory factory = factoryResolver.resolve(request.typePath());
        ComponentType type = factory.type();
        String requestedName = request.component().Name();
        String uniqueName = nameService.uniqueName(requestedName, request.ownerId());

        // New editor drafts keep factory defaults; copies normalize their references before save.
        LinkedHashMap<String, String> properties;
        IddPropertiesRecord record;
        if (request.origin() instanceof WorkspaceImportOrigin.Created) {
            record = factory.createDefault(uniqueName);
            properties = record.toProperties();
        } else {
            properties = request.component().toProperties();
            properties.put("Name", uniqueName);
            normalizeLinkedProperties(request.ownerId(), type, properties);
            record = factory.createFromValues(properties);
        }

        return save(request.ownerId(), request.typePath(), type, record, request.origin(), properties);
    }

    /** Builds the category-specific defaults with the final unique name in one factory call. */
    public WorkspaceComponentDocument importDefault(String ownerId, ComponentTypePath typePath) {
        ComponentFactory factory = factoryResolver.resolve(typePath);
        ComponentType type = factory.type();
        String uniqueName = nameService.uniqueName(type.apiName(), ownerId);
        var record = factory.createDefault(uniqueName);
        return save(ownerId, typePath, type, record, new WorkspaceImportOrigin.Created(), record.toProperties());
    }

    /** Copies the common type, name, provenance, and properties into Mongo's workspace document. */
    private WorkspaceComponentDocument save(
            String ownerId,
            ComponentTypePath typePath,
            ComponentType type,
            IddPropertiesRecord record,
            WorkspaceImportOrigin origin,
            LinkedHashMap<String, String> properties) {
        return repository.save(WorkspaceComponentDocument.builder()
                .id(new ObjectId().toHexString())
                .ownerId(ownerId)
                .name(record.Name())
                .nameKey(nameService.nameKey(record.Name()))
                .domain(typePath.domain().name())
                .category(typePath.category().name())
                .type(type.apiName())
                .epiName(type.eppyName())
                .sourceLibraryId(origin.sourceLibraryId())
                .modified(origin.modified())
                .properties(properties)
                .build());
    }

    /** Resolves editable component names or IDs and stores only owner-scoped workspace IDs. */
    public void normalizeLinkedProperties(
            String ownerId,
            ComponentType type,
            LinkedHashMap<String, String> properties
    ) {
        if (type == ConstructionType.CONSTRUCTION) {
            normalizeConstructionLayers(ownerId, properties);
        } else if (type == ConstructionType.CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE) {
            normalizeHeatSourceConstruction(ownerId, properties);
        } else if (type == ConstructionSetType.CONSTRUCTION_SET) {
            normalizeConstructionSetSlots(ownerId, properties);
        }
    }

    /** Resolves each consecutive material layer and rejects mixed opaque/window constructions. */
    private void normalizeConstructionLayers(String ownerId, LinkedHashMap<String, String> properties) {
        Boolean windowConstruction = null;
        boolean foundBlankLayer = false;
        for (ConstructionLayerProperty layer : ConstructionLayerProperty.values()) {
            String submittedValue = properties.get(layer.fieldName());
            if (submittedValue == null || submittedValue.isBlank()) {
                // Once a layer is blank, later layers would create a gap in the IDF construction.
                foundBlankLayer = true;
                continue;
            }
            if (foundBlankLayer) {
                throw new BuildingComponentValidationException(
                        layer.fieldName(), "Construction layers must be consecutive");
            }
            WorkspaceComponentDocument material = findWorkspaceComponent(
                    ownerId, submittedValue, layer.fieldName());
            ComponentType materialType = typeRegistry.resolve(material.getType());
            if (materialType.category() != ComponentCategory.MATERIAL) {
                throw new BuildingComponentValidationException(
                        layer.fieldName(), "The selected component is not a material");
            }
            boolean isWindowMaterial = !(materialType instanceof MaterialType);
            // A construction must be entirely opaque or entirely fenestration-based.
            if (windowConstruction != null && windowConstruction != isWindowMaterial) {
                throw new BuildingComponentValidationException(
                        layer.fieldName(), "Opaque and window materials cannot be mixed in one construction");
            }
            windowConstruction = isWindowMaterial;
            properties.put(layer.fieldName(), material.getId());
        }
    }

    /** Resolves the parent construction and checks the source's layer positions against it. */
    private void normalizeHeatSourceConstruction(String ownerId, LinkedHashMap<String, String> properties) {
        String field = InternalHeatSourceProperty.CONSTRUCTION_NAME.fieldName();
        WorkspaceComponentDocument construction = findWorkspaceComponent(ownerId, properties.get(field), field);
        if (typeRegistry.resolve(construction.getType()) != ConstructionType.CONSTRUCTION) {
            throw new BuildingComponentValidationException(
                    field, "Internal heat source requires a layered Construction");
        }
        properties.put(field, construction.getId());

        // The two user-entered layer positions are valid only relative to the selected construction.
        long layerCount = java.util.Arrays.stream(ConstructionLayerProperty.values())
                .map(ConstructionLayerProperty::fieldName)
                .map(construction.getProperties()::get)
                .filter(value -> value != null && !value.isBlank())
                .count();
        validateLayerPosition(properties, "Thermal_Source_Present_After_Layer_Number", layerCount, false);
        validateLayerPosition(properties, "Temperature_Calculation_Requested_After_Layer_Number", layerCount, true);
    }

    /** Applies the distinct position bounds for source placement and requested temperature output. */
    private void validateLayerPosition(
            Map<String, String> properties, String field, long layerCount, boolean finalLayerAllowed
    ) {
        int layer = Integer.parseInt(properties.get(field));
        if (layer > layerCount || (!finalLayerAllowed && layer >= layerCount)) {
            throw new BuildingComponentValidationException(
                    field, finalLayerAllowed
                            ? "The temperature layer exceeds the selected construction layer count"
                            : "The source must be placed between two construction layers");
        }
    }

    /** Resolves every filled construction-set slot to an owned workspace construction. */
    private void normalizeConstructionSetSlots(String ownerId, LinkedHashMap<String, String> properties) {
        for (ConstructionSetProperty slot : ConstructionSetProperty.values()) {
            String submittedValue = properties.get(slot.fieldName());
            if (submittedValue == null || submittedValue.isBlank()) continue;
            WorkspaceComponentDocument construction = findWorkspaceComponent(
                    ownerId, submittedValue, slot.fieldName());
            // Reject other construction subtypes that cannot be assigned to a construction-set slot.
            if (typeRegistry.resolve(construction.getType()).category() != ComponentCategory.CONSTRUCTION) {
                throw new BuildingComponentValidationException(
                        slot.fieldName(), "Construction set fields must reference a usable construction");
            }
            properties.put(slot.fieldName(), construction.getId());
        }
    }

    /** Accepts either a workspace ID or an editor name, always scoped to the current owner. */
    private WorkspaceComponentDocument findWorkspaceComponent(String ownerId, String idOrName, String field) {
        if (idOrName == null || idOrName.isBlank()) {
            throw new BuildingComponentValidationException(field, "A component must be selected");
        }
        return repository.findByIdAndOwnerId(idOrName, ownerId)
                .or(() -> repository.findByOwnerIdAndNameKey(ownerId, nameService.nameKey(idOrName)))
                .orElseThrow(() -> new BuildingComponentValidationException(
                        field, "Referenced workspace component was not found"));
    }
}
