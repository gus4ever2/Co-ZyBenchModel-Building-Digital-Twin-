package com.example.cozybench.dto.constructionsDTO.ResponseAggregator;

import lombok.Builder;

@Builder
public record ResponseComponentDTO (
        String id,
        String type,
        java.util.LinkedHashMap<String, String> properties
) implements ResponseAggregatorDTO {}
