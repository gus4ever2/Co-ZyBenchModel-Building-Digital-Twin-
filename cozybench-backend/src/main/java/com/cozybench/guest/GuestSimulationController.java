package com.cozybench.guest;

import com.cozybench.simulation.dto.CurrentSimulationResponse;
import com.cozybench.simulation.dto.SimulationComparisonRequest;
import com.cozybench.simulation.dto.SimulationListResponse;
import com.cozybench.simulation.dto.SimulationResultsResponse;
import com.cozybench.simulation.dto.SimulationSummaryResponse;
import com.cozybench.simulation.dto.StartSimulationRequest;
import com.cozybench.simulation.service.SimulationComparisonService;
import com.cozybench.simulation.service.SimulationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Validated
@RestController
@RequestMapping("/api/v1/guest/simulations")
public class GuestSimulationController {
    private final SimulationService simulations;
    private final SimulationComparisonService comparisons;
    private final GuestSessionRegistry guestSessions;

    public GuestSimulationController(
            SimulationService simulations,
            SimulationComparisonService comparisons,
            GuestSessionRegistry guestSessions
    ) {
        this.simulations = simulations;
        this.comparisons = comparisons;
        this.guestSessions = guestSessions;
    }

    @GetMapping("/name-availability")
    public Map<String, Boolean> nameAvailability(
            HttpServletRequest request,
            @RequestParam @NotBlank @Size(max = 80) String name
    ) {
        return Map.of("available", simulations.isNameAvailable(
                guest(request).guestSessionId(), null, name));
    }

    @PostMapping
    public ResponseEntity<SimulationSummaryResponse> start(
            HttpServletRequest request,
            @Valid @RequestBody StartSimulationRequest body
    ) {
        GuestSessionRecord guest = guest(request);
        SimulationSummaryResponse started = simulations.startGuest(
                guest.guestSessionId(), body
        );
        guest.addSimulation(started.id());
        return ResponseEntity.status(201).body(started);
    }

    @PostMapping("/comparison")
    public Map<String, Object> compare(
            HttpServletRequest request,
            @Valid @RequestBody SimulationComparisonRequest body
    ) {
        return comparisons.compareGuest(guest(request).guestSessionId(), body);
    }

    @GetMapping("/analytics/available")
    public Map<String, Object> availableAnalytics() {
        return simulations.availableAnalytics();
    }

    @GetMapping("/history")
    public SimulationListResponse history(HttpServletRequest request) {
        return simulations.history(guest(request).guestSessionId(), null);
    }

    @GetMapping("/current")
    public ResponseEntity<CurrentSimulationResponse> current(HttpServletRequest request) {
        return simulations.current(guest(request).guestSessionId(), null)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/{simulationId}")
    public SimulationSummaryResponse get(
            HttpServletRequest request,
            @PathVariable String simulationId
    ) {
        return simulations.get(guest(request).guestSessionId(), null, simulationId);
    }

    @PostMapping("/{simulationId}/cancel")
    public SimulationSummaryResponse cancel(
            HttpServletRequest request,
            @PathVariable String simulationId
    ) {
        return simulations.cancel(guest(request).guestSessionId(), null, simulationId);
    }

    @DeleteMapping("/{simulationId}")
    public ResponseEntity<Void> delete(
            HttpServletRequest request,
            @PathVariable String simulationId
    ) {
        String guestId = guest(request).guestSessionId();
        simulations.delete(guestId, null, simulationId);
        guestSessions.removeSimulation(guestId, simulationId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(value = "/{simulationId}/export", produces = "application/json")
    public ResponseEntity<org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody> export(
            HttpServletRequest request,
            @PathVariable String simulationId
    ) {
        var body = simulations.exportJson(
                guest(request).guestSessionId(), null, simulationId);
        return ResponseEntity.ok()
                .header("Content-Disposition", org.springframework.http.ContentDisposition.attachment()
                        .filename("simulation-" + simulationId + ".json").build().toString())
                .header("Cache-Control", "no-store")
                .body(body);
    }

    @GetMapping("/{simulationId}/results")
    public SimulationResultsResponse results(
            HttpServletRequest request,
            @PathVariable String simulationId,
            @RequestParam(defaultValue = "0") @Min(0) int offset,
            @RequestParam(required = false) @Min(1) @Max(10000) Integer limit
    ) {
        return simulations.results(
                guest(request).guestSessionId(), null, simulationId, offset, limit
        );
    }

    @GetMapping("/{simulationId}/analytics")
    public Map<String, Object> analytics(
            HttpServletRequest request,
            @PathVariable String simulationId,
            @RequestParam(defaultValue = "0") @Min(0) int startIndex,
            @RequestParam(required = false) @Min(0) Integer endIndex
    ) {
        return simulations.analyticsGuest(
                guest(request).guestSessionId(), simulationId, startIndex, endIndex
        );
    }

    @PostMapping("/{simulationId}/analytics")
    public Map<String, Object> selectedAnalytics(
            HttpServletRequest request,
            @PathVariable String simulationId,
            @RequestBody Map<String, Object> options
    ) {
        return simulations.selectedAnalyticsGuest(
                guest(request).guestSessionId(), simulationId, options
        );
    }

    private GuestSessionRecord guest(HttpServletRequest request) {
        Object value = request.getAttribute(GuestSessionRegistry.REQUEST_ATTRIBUTE);
        if (value instanceof GuestSessionRecord guest) return guest;
        return guestSessions.getOrCreate(request.getSession(true));
    }
}
