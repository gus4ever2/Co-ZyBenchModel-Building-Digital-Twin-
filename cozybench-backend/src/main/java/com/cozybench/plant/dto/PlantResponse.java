package com.cozybench.plant.dto;

import java.time.Instant;

public record PlantResponse(
        String id,
        String name,
        String city,
        String status,
        int progress,
        Instant createdAt,
        Instant startedAt,
        Instant completedAt,
        String error,
        int profileGridPointCount,
        double reflectance,
        double transmittance,
        double vcmax,
        double jmax,
        double rd,
        boolean modelReady,
        Double totalLeafAreaM2
) {
}
