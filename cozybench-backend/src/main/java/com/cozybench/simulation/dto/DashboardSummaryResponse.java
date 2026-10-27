package com.cozybench.simulation.dto;

public record DashboardSummaryResponse(
        long total,
        long openWindowSimulations,
        long plantSimulations,
        long co2ControlSimulations,
        long constructionSets,
        long constructions,
        long plantModels,
        long materials
) {
}
