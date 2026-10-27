package com.cozybench.simulation.controller;

import com.cozybench.simulation.dto.DashboardSummaryResponse;
import com.cozybench.simulation.service.SimulationService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final SimulationService simulationService;

    public DashboardController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @GetMapping("/summary")
    public DashboardSummaryResponse summary(@AuthenticationPrincipal Jwt jwt) {
        return simulationService.dashboard(
                jwt.getSubject(),
                jwt.getClaimAsString("email")
        );
    }
}
