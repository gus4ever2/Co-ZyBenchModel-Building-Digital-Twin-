package com.cozybench.building.service.naming;

import com.cozybench.building.model.document.WorkspaceComponentDocument;
import com.cozybench.building.repository.WorkspaceComponentRepository;
import org.springframework.stereotype.Service;

import java.util.Locale;

/** Generates unique user-visible names and the normalized keys used for lookup. */
@Service
public class ComponentNameService {

    private final WorkspaceComponentRepository repository;

    public ComponentNameService(WorkspaceComponentRepository repository) {
        this.repository = repository;
    }

    /** Finds a free name for a new object without excluding any existing object. */
    public String uniqueName(String requestedName, String ownerId) {
        return uniqueName(requestedName, ownerId, null);
    }

    /** Finds a free name while allowing an update to retain its own current name. */
    public String uniqueName(
            String requestedName,
            String ownerId,
            String excludedComponentId
    ) {
        // Keep the requested base and add the first available numeric suffix if needed.
        String baseName = requireName(requestedName);
        String candidate = baseName;
        int suffix = 1;

        while (isTaken(candidate, ownerId, excludedComponentId)) {
            candidate = baseName + " (" + suffix + ")";
            suffix++;
        }
        return candidate;
    }

    /** Produces the normalized key used by MongoDB name lookups. */
    public String nameKey(String name) {
        return normalizedNameKey(name);
    }

    /** Returns the normalized key shared by MongoDB and in-memory name checks. */
    public static String normalizedNameKey(String name) {
        return requireName(name).toLowerCase(Locale.ROOT);
    }

    private boolean isTaken(
            String name,
            String ownerId,
            String excludedComponentId
    ) {
        String key = nameKey(name);
        return repository.findByOwnerIdAndNameKey(ownerId, key)
                .map(WorkspaceComponentDocument::getId)
                .filter(id -> !id.equals(excludedComponentId))
                .isPresent();
    }

    private static String requireName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Component name is required");
        }
        return name.trim();
    }
}
