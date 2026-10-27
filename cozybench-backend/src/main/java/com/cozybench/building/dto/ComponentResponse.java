package com.cozybench.building.dto;

import java.util.LinkedHashMap;

/** Selected editor item, including editable IDD fields in their display order. */
public record ComponentResponse(
        String id,
        String type,
        LinkedHashMap<String, String> properties
) {
}
