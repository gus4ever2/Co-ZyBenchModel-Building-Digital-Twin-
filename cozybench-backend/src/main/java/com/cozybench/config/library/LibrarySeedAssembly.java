package com.cozybench.config.library;

import org.bson.Document;
import org.bson.types.ObjectId;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * In-memory representation of the complete library before MongoDB is touched.
 * It assigns stable references for this seed run and rejects invalid input early.
 */
final class LibrarySeedAssembly {

    private final Map<String, Document> allObjectsByName = new LinkedHashMap<>();
    private final Map<String, Map<String, Document>> objectsBySeedAndName = new LinkedHashMap<>();
    private final Map<String, List<Document>> objectsBySeed = new LinkedHashMap<>();
    private final List<Document> objects = new ArrayList<>();

    void register(String seedName, String category, List<Document> sourceObjects) {
        Map<String, Document> objectsByName = new LinkedHashMap<>();
        for (Document input : sourceObjects) {
            String name = input.getString("name");
            String nameKey = normalizedNameKey(name);
            if (allObjectsByName.containsKey(nameKey)) {
                throw new IllegalArgumentException("Duplicate library object name: " + name);
            }
            if (input.getString("type") == null || input.getString("type").isBlank()) {
                throw new IllegalArgumentException("Missing type for library object: " + name);
            }
            Object rawProperties = input.get("properties");
            if (!(rawProperties instanceof Map<?, ?> rawMap)) {
                throw new IllegalArgumentException("Missing properties for library object: " + name);
            }

            Document properties = new Document();
            rawMap.forEach((field, value) -> properties.put(String.valueOf(field), value));
            Document object = new Document("_id", new ObjectId())
                    .append("name", name.trim())
                    .append("nameKey", nameKey)
                    .append("category", category)
                    .append("type", input.getString("type"))
                    .append("properties", properties);
            allObjectsByName.put(nameKey, object);
            objectsByName.put(nameKey, object);
            objects.add(object);
        }
        objectsBySeedAndName.put(seedName, objectsByName);
        objectsBySeed.put(seedName, List.copyOf(objectsByName.values()));
    }

    List<Document> objectsFor(String seedName) {
        return objectsBySeed.getOrDefault(seedName, List.of());
    }

    void replaceReferences(
            Document owner,
            Document properties,
            Set<String> fields,
            String targetSeedName
    ) {
        Map<String, Document> targets = objectsBySeedAndName.getOrDefault(targetSeedName, Map.of());
        for (String field : fields) {
            if ("Name".equals(field)) {
                continue;
            }
            Object value = properties.get(field);
            if (value == null || value instanceof String text && text.isBlank()) {
                continue;
            }
            if (!(value instanceof String name)) {
                throw new IllegalArgumentException(
                        "Invalid reference " + field + " in " + owner.getString("name")
                );
            }
            Document target = targets.get(normalizedNameKey(name));
            if (target == null) {
                throw new IllegalArgumentException(
                        "Missing reference '" + name + "' in " + owner.getString("name") + "." + field
                );
            }
            properties.put(field, target.getObjectId("_id").toHexString());
        }
    }

    List<Document> result() {
        return List.copyOf(objects);
    }

    private String normalizedNameKey(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Library object name is required");
        }
        return name.trim().toLowerCase(Locale.ROOT);
    }
}
