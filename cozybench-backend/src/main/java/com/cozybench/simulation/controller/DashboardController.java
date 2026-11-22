package com.cozybench.simulation.controller;

import com.cozybench.guest.GuestSessionRecord;
import com.cozybench.guest.GuestSessionRegistry;
import com.cozybench.simulation.dto.DashboardSummaryResponse;
import com.cozybench.simulation.service.SimulationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final SimulationService simulationService;
    private final GuestSessionRegistry guestSessions;

    public DashboardController(SimulationService simulationService, GuestSessionRegistry guestSessions) {
        this.simulationService = simulationService;
        this.guestSessions = guestSessions;
    }

    @GetMapping("/summary")
    public DashboardSummaryResponse summary(HttpServletRequest request) {
        return simulationService.dashboard(
                ownerId(request),
                null
        );
    }

    private String ownerId(HttpServletRequest request) {
        Object value = request.getAttribute(GuestSessionRegistry.REQUEST_ATTRIBUTE);
        if (value instanceof GuestSessionRecord record) return record.guestSessionId();
        return guestSessions.getOrCreate(request.getSession(true)).guestSessionId();
    }
}
