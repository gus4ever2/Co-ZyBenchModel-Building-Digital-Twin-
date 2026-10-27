package com.cozybench.building.factory;

import com.cozybench.building.model.type.ComponentType;
import com.cozybench.building.model.validation.IddPropertiesRecord;

/**
 * Creates the typed IDD record for one EnergyPlus component type.
 * Defaults belong to the record constructor; submitted properties are validated here.
 */
public interface ComponentFactory {

    ComponentType type();

    /** Creates a new object from this type's predefined defaults and the requested name. */
    IddPropertiesRecord createDefault(String name);

    /** Validates supplied values; omitted values are filled by the record constructor. */
    IddPropertiesRecord createFromValues(java.util.Map<String, String> properties);
}
