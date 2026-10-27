package com.cozybench.simulation.dto;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

public record ComponentSnapshot(
        String id,
        String name,
        String type,
        Map<String, String> properties
) {
    public ComponentSnapshot {
        properties = properties == null
                ? Map.of()
                : Collections.unmodifiableMap(new LinkedHashMap<>(properties));
    }
}
