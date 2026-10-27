package com.cozybench.simulation.dto;

import java.util.List;

public record SimulationListResponse(
        int count,
        List<SimulationSummaryResponse> simulations
) {
    public SimulationListResponse {
        simulations = simulations == null ? List.of() : List.copyOf(simulations);
    }
}
