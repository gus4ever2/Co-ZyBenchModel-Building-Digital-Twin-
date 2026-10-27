package com.cozybench.building.model.validation;

import java.lang.reflect.RecordComponent;
import java.math.BigDecimal;
import java.util.LinkedHashMap;

/** Marker contract for records whose component fields map to EnergyPlus IDD properties. */
public interface IddPropertiesRecord {
    String Name();

    /** Converts IDD record components to the ordered property map stored by MongoDB. */
    default LinkedHashMap<String, String> toProperties() {
        LinkedHashMap<String, String> properties = new LinkedHashMap<>();
        for (RecordComponent component : getClass().getRecordComponents()) {
            try {
                var accessor = component.getAccessor();
                // Test/local record implementations may be package-private even though accessors are public.
                if (!accessor.canAccess(this) && !accessor.trySetAccessible()) {
                    throw new IllegalAccessException("Record accessor is not accessible");
                }
                properties.put(component.getName(), stringify(accessor.invoke(this)));
            } catch (ReflectiveOperationException exception) {
                throw new IllegalStateException(
                        "Could not read IDD record component: " + component.getName(), exception);
            }
        }
        return properties;
    }

    /** Preserves blank optional fields and writes decimal values without scientific notation. */
    private static String stringify(Object value) {
        if (value == null) {
            return "";
        }
        if (value instanceof Double number) {
            return BigDecimal.valueOf(number).stripTrailingZeros().toPlainString();
        }
        return value.toString();
    }
}
