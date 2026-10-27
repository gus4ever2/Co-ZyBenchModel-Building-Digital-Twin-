package com.cozybench.building.resolver;

import com.cozybench.building.model.type.ComponentCategory;
import com.cozybench.building.model.type.ComponentDomain;
import com.cozybench.building.model.type.ComponentType;
import com.cozybench.building.model.type.ComponentTypePath;
import org.springframework.stereotype.Component;

import java.lang.reflect.RecordComponent;

/**
 * Resolves the domain, category, and type fields in the order declared by the
 * request record. Reflection locates the next record component; the category
 * supplies the enum family used to resolve the terminal type name.
 */
@Component
public final class ComponentTypeHierarchyResolver {

    public ComponentType resolve(ComponentTypePath path) {
        RecordComponent[] levels = path.getClass().getRecordComponents();
        if (levels == null || levels.length == 0) {
            throw new IllegalArgumentException("Component type path must be a record with at least one field");
        }
        return resolve(path, levels, 0, null, null);
    }

    /** Reads each declared path field, passing its resolved context to the next level. */
    private ComponentType resolve(
            ComponentTypePath path,
            RecordComponent[] levels,
            int index,
            ComponentDomain domain,
            ComponentCategory category
    ) {
        if (index >= levels.length) {
            throw new IllegalArgumentException("Component type path ended before a terminal type was resolved");
        }

        RecordComponent current = levels[index];
        Object currentValue = read(path, current);
        RecordComponent next = index + 1 < levels.length ? levels[index + 1] : null;

        if (currentValue instanceof ComponentDomain selectedDomain) {
            domain = selectedDomain;
        } else if (currentValue instanceof ComponentCategory selectedCategory) {
            if (domain == null || !domain.supports(selectedCategory)) {
                throw new IllegalArgumentException("Unsupported component category: " + selectedCategory);
            }
            category = selectedCategory;
        }

        // The record shape provides the stopping condition; no enum terminal flag is needed.
        if (next == null) {
            if (category == null || !(currentValue instanceof String typeName)) {
                throw new IllegalArgumentException("The last component path field must be a type name");
            }
            return category.resolveType(typeName);
        }

        return resolve(path, levels, index + 1, domain, category);
    }

    /** Invokes the accessor for the current record level and wraps reflection failures. */
    private Object read(ComponentTypePath path, RecordComponent component) {
        try {
            return component.getAccessor().invoke(path);
        } catch (ReflectiveOperationException exception) {
            throw new IllegalStateException(
                    "Could not read component path field: " + component.getName(), exception);
        }
    }
}
