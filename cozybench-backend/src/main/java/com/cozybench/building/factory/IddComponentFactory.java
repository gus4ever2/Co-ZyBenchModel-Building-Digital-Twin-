package com.cozybench.building.factory;

import com.cozybench.building.exception.BuildingComponentValidationException;
import com.cozybench.building.model.type.ComponentType;
import com.cozybench.building.model.validation.IddPropertiesRecord;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;

import java.lang.reflect.Constructor;
import java.lang.reflect.RecordComponent;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Converts property maps to IDD records, uses record defaults, and validates submitted values. */
public final class IddComponentFactory<T extends Record & IddPropertiesRecord>
        implements ComponentFactory {

    private final ComponentType type;
    private final Class<T> recordType;
    private final Validator validator;

    public IddComponentFactory(
            ComponentType type,
            Class<T> recordType,
            Validator validator
    ) {
        this.type = type;
        this.recordType = recordType;
        this.validator = validator;
    }

    @Override
    public ComponentType type() {
        return type;
    }

    @Override
    public T createDefault(String name) {
        // Constructing with only a name lets the record fill its omitted-field defaults.
        LinkedHashMap<String, String> properties = new LinkedHashMap<>();
        properties.put("Name", name);
        return instantiate(properties);
    }

    @Override
    public T createFromValues(Map<String, String> properties) {
        // Reject typos before reflection silently ignores properties it does not recognize.
        rejectUnknownFields(properties);
        T record = instantiate(properties);
        // Validate after the canonical constructor has applied any defaults.
        validate(record);
        return record;
    }

    /** Fails fast when submitted keys do not match the IDD record component names. */
    private void rejectUnknownFields(Map<String, String> properties) {
        Set<String> allowed = Arrays.stream(recordType.getRecordComponents())
                .map(RecordComponent::getName)
                .collect(Collectors.toSet());

        LinkedHashMap<String, String> errors = properties.keySet().stream()
                .filter(field -> !allowed.contains(field))
                .collect(Collectors.toMap(
                        Function.identity(),
                        field -> "Unknown field for " + type.eppyName(),
                        (first, ignored) -> first,
                        LinkedHashMap::new
                ));
        if (!errors.isEmpty()) {
            throw new BuildingComponentValidationException(errors);
        }
    }

    /** Converts the ordered property map to the canonical constructor's argument list. */
    private T instantiate(Map<String, String> properties) {
        RecordComponent[] components = recordType.getRecordComponents();
        // Record component order is the canonical constructor's parameter order.
        Class<?>[] parameterTypes = Arrays.stream(components)
                .map(RecordComponent::getType)
                .toArray(Class<?>[]::new);
        Object[] values = Arrays.stream(components)
                // Missing and blank inputs become null so the record constructor can apply defaults.
                .map(component -> convert(properties.get(component.getName()), component.getType()))
                .toArray();

        try {
            Constructor<T> constructor = recordType.getDeclaredConstructor(parameterTypes);
            return constructor.newInstance(values);
        } catch (ReflectiveOperationException | NumberFormatException exception) {
            throw new BuildingComponentValidationException(
                    "properties",
                    "One or more fields have an invalid value type"
            );
        }
    }

    /** Converts text inputs to the wrapper types supported by the IDD records. */
    private Object convert(String value, Class<?> targetType) {
        String normalized = value == null ? null : value.trim();
        if (normalized == null || normalized.isEmpty()) {
            return null;
        }
        if (targetType == String.class) {
            return normalized;
        }
        if (targetType == Double.class) {
            return Double.valueOf(normalized);
        }
        if (targetType == Integer.class) {
            return Integer.valueOf(normalized);
        }
        throw new IllegalArgumentException("Unsupported record component type: " + targetType);
    }

    /** Turns Jakarta constraint violations into field-addressable editor errors. */
    private void validate(T record) {
        Set<ConstraintViolation<T>> violations = validator.validate(record);
        if (violations.isEmpty()) {
            return;
        }

        // Preserve field-oriented errors for the editor rather than returning a generic failure.
        LinkedHashMap<String, String> errors = violations.stream()
                .collect(Collectors.toMap(
                        violation -> violation.getPropertyPath().toString(),
                        ConstraintViolation::getMessage,
                        (first, ignored) -> first,
                        LinkedHashMap::new
                ));
        throw new BuildingComponentValidationException(errors);
    }

}
