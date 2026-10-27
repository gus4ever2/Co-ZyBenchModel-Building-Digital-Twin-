package com.cozybench.simulation.controller;

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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
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

    public SimulationController(
            SimulationService simulationService,
            SimulationComparisonService comparisonService
    ) {
        this.simulationService = simulationService;
        this.comparisonService = comparisonService;
    }

    @PostMapping("/comparison")
    public java.util.Map<String, Object> compare(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody SimulationComparisonRequest request
    ) {
        return comparisonService.compare(
                jwt.getSubject(),
                jwt.getClaimAsString("email"),
                request
        );
    }

    @PostMapping
    public ResponseEntity<SimulationSummaryResponse> start(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody StartSimulationRequest request
    ) {
        return ResponseEntity.status(201).body(simulationService.start(
                jwt.getSubject(),
                jwt.getClaimAsString("email"),
                request
        ));
    }

    @GetMapping
    public SimulationListResponse all(@AuthenticationPrincipal Jwt jwt) {
        return simulationService.all(jwt.getSubject(), jwt.getClaimAsString("email"));
    }

    @GetMapping("/history")
    public SimulationListResponse history(@AuthenticationPrincipal Jwt jwt) {
        return simulationService.history(jwt.getSubject(), jwt.getClaimAsString("email"));
    }

    @GetMapping("/name-availability")
    public java.util.Map<String, Boolean> nameAvailability(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam @NotBlank @Size(max = 80) String name
    ) {
        return java.util.Map.of("available", simulationService.isNameAvailable(
                jwt.getSubject(), jwt.getClaimAsString("email"), name));
    }

    @GetMapping("/current")
    public ResponseEntity<CurrentSimulationResponse> current(
            @AuthenticationPrincipal Jwt jwt
    ) {
        return simulationService.current(jwt.getSubject(), jwt.getClaimAsString("email"))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/{simulationId}")
    public SimulationSummaryResponse get(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String simulationId
    ) {
        return simulationService.get(
                jwt.getSubject(),
                jwt.getClaimAsString("email"),
                simulationId
        );
    }

    @PostMapping("/{simulationId}/cancel")
    public SimulationSummaryResponse cancel(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String simulationId
    ) {
        return simulationService.cancel(
                jwt.getSubject(),
                jwt.getClaimAsString("email"),
                simulationId
        );
    }

    @DeleteMapping("/{simulationId}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String simulationId
    ) {
        simulationService.delete(
                jwt.getSubject(),
                jwt.getClaimAsString("email"),
                simulationId
        );
        return ResponseEntity.noContent().build();
    }

    @GetMapping(value = "/{simulationId}/export", produces = "application/json")
    public ResponseEntity<org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody> export(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String simulationId
    ) {
        var body = simulationService.exportJson(jwt.getSubject(), jwt.getClaimAsString("email"), simulationId);
        return ResponseEntity.ok()
                .header("Content-Disposition", org.springframework.http.ContentDisposition.attachment()
                        .filename("simulation-" + simulationId + ".json").build().toString())
                .header("Cache-Control", "no-store")
                .body(body);
    }

    @GetMapping("/{simulationId}/analytics")
    public java.util.Map<String, Object> analytics(
            @AuthenticationPrincipal Jwt jwt, @PathVariable String simulationId,
            @RequestParam(defaultValue = "0") @Min(0) int startIndex,
            @RequestParam(required = false) @Min(0) Integer endIndex) {
        return simulationService.analytics(jwt.getSubject(), jwt.getClaimAsString("email"),
                simulationId, startIndex, endIndex);
    }

    @GetMapping("/analytics/available")
    public java.util.Map<String, Object> availableAnalytics(@AuthenticationPrincipal Jwt jwt) {
        return simulationService.availableAnalytics();
    }

    @PostMapping("/{simulationId}/analytics")
    public java.util.Map<String, Object> selectedAnalytics(
            @AuthenticationPrincipal Jwt jwt, @PathVariable String simulationId,
            @RequestBody java.util.Map<String, Object> options) {
        return simulationService.selectedAnalytics(jwt.getSubject(), jwt.getClaimAsString("email"), simulationId, options);
    }

    @GetMapping("/{simulationId}/results")
    public SimulationResultsResponse results(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String simulationId,
            @RequestParam(defaultValue = "0") @Min(0) int offset,
            @RequestParam(required = false) @Min(1) @Max(10000) Integer limit
    ) {
        return simulationService.results(
                jwt.getSubject(),
                jwt.getClaimAsString("email"),
                simulationId,
                offset,
                limit
        );
    }
}
