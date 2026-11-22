package com.cozybench.building.model.type;

import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

/** Resolves canonical API type keys and legacy EnergyPlus names during migration. */
@Component
public class ComponentTypeRegistry {

    private final Map<String, ComponentType> typesByName = new LinkedHashMap<>();

    public ComponentTypeRegistry() {
        // Accept both identifiers so old stored documents and current API paths resolve consistently.
        allTypes().forEach(type -> {
            typesByName.put(normalize(type.apiName()), type);
            typesByName.put(normalize(type.eppyName()), type);
        });
    }

    /** Resolves either an API enum identifier or an EnergyPlus IDD name. */
    public ComponentType resolve(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Component type is required");
        }

        ComponentType type = typesByName.get(normalize(value));
        if (type == null) {
            throw new IllegalArgumentException("Unsupported component type: " + value);
        }
        return type;
    }

    /** Converts an EnergyPlus object name to the stable API identifier used by the editor. */
    public String apiNameOf(String eppyName) {
        return resolve(eppyName).apiName();
    }

    /** Returns canonical API names for new documents and API queries. */
    public Set<String> apiNames(ComponentCategory category) {
        return allTypes()
                .filter(type -> type.category() == category)
                .map(ComponentType::apiName)
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
    }

    /** Returns both current and legacy names while old Mongo documents are migrated. */
    public Set<String> eppyNames(ComponentCategory category) {
        // Include current API identifiers and legacy IDD names during workspace data transition.
        return allTypes()
                .filter(type -> type.category() == category)
                .flatMap(type -> Stream.of(type.apiName(), type.eppyName()))
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
    }

    /** Combines the separate enum families into one stream for registry operations. */
    private Stream<ComponentType> allTypes() {
        return Stream.of(
                Arrays.stream(MaterialType.values()),
                Arrays.stream(WindowMaterialType.values()),
                Arrays.stream(ConstructionType.values()),
                Arrays.stream(ConstructionSetType.values())
        ).flatMap(stream -> stream.map(type -> (ComponentType) type));
    }

    /** Makes stored/API names case-insensitive while keeping locale-independent behavior. */
    private String normalize(String value) {
        return value.trim().toUpperCase(Locale.ROOT);
    }
}
