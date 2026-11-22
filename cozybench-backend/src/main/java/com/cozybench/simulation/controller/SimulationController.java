package com.cozybench.simulation.controller;

import com.cozybench.guest.GuestSessionRecord;
import com.cozybench.guest.GuestSessionRegistry;
import com.cozybench.simulation.dto.CurrentSimulationResponse;
import com.cozybench.simulation.dto.SimulationListResponse;
import com.cozybench.simulation.dto.SimulationComparisonRequest;
import com.cozybench.simulation.dto.SimulationResultsResponse;
import com.cozybench.simulation.dto.SimulationSummaryResponse;
import com.cozybench.simulation.dto.StartSimulationRequest;
import com.cozybench.simulation.service.SimulationService;
import com.cozybench.simulation.service.SimulationComparisonService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/simulations")
public class SimulationController {

    private final SimulationService simulationService;
    private final SimulationComparisonService comparisonService;
    private final GuestSessionRegistry guestSessions;

    public SimulationController(
            SimulationService simulationService,
            SimulationComparisonService comparisonService,
            GuestSessionRegistry guestSessions
    ) {
        this.simulationService = simulationService;
        this.comparisonService = comparisonService;
        this.guestSessions = guestSessions;
    }

    @PostMapping("/comparison")
    public java.util.Map<String, Object> compare(
            HttpServletRequest httpRequest,
            @Valid @RequestBody SimulationComparisonRequest body
    ) {
        return comparisonService.compare(
                ownerId(httpRequest),
                null,
                body
        );
    }

    @PostMapping
    public ResponseEntity<SimulationSummaryResponse> start(
            HttpServletRequest httpRequest,
            @Valid @RequestBody StartSimulationRequest body
    ) {
        return ResponseEntity.status(201).body(simulationService.start(
                ownerId(httpRequest),
                null,
                body
        ));
    }

    @GetMapping
    public SimulationListResponse all(HttpServletRequest request) {
        return simulationService.all(ownerId(request), null);
    }

    @GetMapping("/history")
    public SimulationListResponse history(HttpServletRequest request) {
        return simulationService.history(ownerId(request), null);
    }

    @GetMapping("/name-availability")
    public java.util.Map<String, Boolean> nameAvailability(
            HttpServletRequest request,
            @RequestParam @NotBlank @Size(max = 80) String name
    ) {
        return java.util.Map.of("available", simulationService.isNameAvailable(
                ownerId(request), null, name));
    }

    @GetMapping("/current")
    public ResponseEntity<CurrentSimulationResponse> current(
            HttpServletRequest request
    ) {
        return simulationService.current(ownerId(request), null)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/{simulationId}")
    public SimulationSummaryResponse get(
            HttpServletRequest request,
            @PathVariable String simulationId
    ) {
        return simulationService.get(
                ownerId(request),
                null,
                simulationId
        );
    }

    @PostMapping("/{simulationId}/cancel")
    public SimulationSummaryResponse cancel(
            HttpServletRequest request,
            @PathVariable String simulationId
    ) {
        return simulationService.cancel(
                ownerId(request),
                null,
                simulationId
        );
    }

    @DeleteMapping("/{simulationId}")
    public ResponseEntity<Void> delete(
            HttpServletRequest request,
            @PathVariable String simulationId
    ) {
        simulationService.delete(
                ownerId(request),
                null,
                simulationId
        );
        return ResponseEntity.noContent().build();
    }

    @GetMapping(value = "/{simulationId}/export", produces = "application/json")
    public ResponseEntity<org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody> export(
            HttpServletRequest request,
            @PathVariable String simulationId
    ) {
        var body = simulationService.exportJson(ownerId(request), null, simulationId);
        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .header("Content-Disposition", org.springframework.http.ContentDisposition.attachment()
                        .filename("simulation-" + simulationId + ".json").build().toString())
                .header("Cache-Control", "no-store")
                .body(body);
    }

    @GetMapping("/{simulationId}/analytics")
    public java.util.Map<String, Object> analytics(
            HttpServletRequest request, @PathVariable String simulationId,
            @RequestParam(defaultValue = "0") @Min(0) int startIndex,
            @RequestParam(required = false) @Min(0) Integer endIndex) {
        return simulationService.analytics(ownerId(request), null,
                simulationId, startIndex, endIndex);
    }

    @GetMapping("/analytics/available")
    public java.util.Map<String, Object> availableAnalytics() {
        return simulationService.availableAnalytics();
    }

    @PostMapping("/{simulationId}/analytics")
    public java.util.Map<String, Object> selectedAnalytics(
            HttpServletRequest request, @PathVariable String simulationId,
            @RequestBody java.util.Map<String, Object> options) {
        return simulationService.selectedAnalytics(ownerId(request), null, simulationId, options);
    }

    @GetMapping("/{simulationId}/results")
    public SimulationResultsResponse results(
            HttpServletRequest request,
            @PathVariable String simulationId,
            @RequestParam(defaultValue = "0") @Min(0) int offset,
            @RequestParam(required = false) @Min(1) @Max(10000) Integer limit
    ) {
        return simulationService.results(
                ownerId(request),
                null,
                simulationId,
                offset,
                limit
        );
    }

    private String ownerId(HttpServletRequest request) {
        Object value = request.getAttribute(GuestSessionRegistry.REQUEST_ATTRIBUTE);
        if (value instanceof GuestSessionRecord record) return record.guestSessionId();
        return guestSessions.getOrCreate(request.getSession(true)).guestSessionId();
    }
}
