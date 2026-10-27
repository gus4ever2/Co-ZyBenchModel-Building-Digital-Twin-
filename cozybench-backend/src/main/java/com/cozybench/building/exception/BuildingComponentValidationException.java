package com.cozybench.building.exception;

import java.util.Map;

/** Validation failure with field-specific messages suitable for returning to the editor. */
public class BuildingComponentValidationException extends RuntimeException {

    private final Map<String, String> errors;

    public BuildingComponentValidationException(Map<String, String> errors) {
        super("The submitted component properties are invalid");
        this.errors = Map.copyOf(errors);
    }

    public BuildingComponentValidationException(String field, String message) {
        this(Map.of(field, message));
    }

    public Map<String, String> getErrors() {
        return errors;
    }
}
