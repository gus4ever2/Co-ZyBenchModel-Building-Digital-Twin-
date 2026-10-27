package com.cozybench.plant.dto;

import java.util.List;

public record PlantListResponse(
        int count,
        List<PlantResponse> plants
) {
    public PlantListResponse {
        plants = plants == null ? List.of() : List.copyOf(plants);
    }
}
