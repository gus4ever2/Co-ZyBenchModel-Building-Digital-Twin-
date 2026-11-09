package com.cozybench.simulation.service;

import com.cozybench.simulation.dto.SimulationComparisonRequest;
import org.springframework.stereotype.Service;
import java.util.LinkedHashMap;
import java.util.Map;

/** Authorizes requests; all scientific calculations are owned by Python. */
@Service
public class SimulationComparisonService {
    private final SimulationService simulations;
    private final CosimulatorSimulationClient python;

    public SimulationComparisonService(SimulationService simulations, CosimulatorSimulationClient python) {
        this.simulations = simulations;
        this.python = python;
    }

    public Map<String, Object> compare(String ownerId, String email, SimulationComparisonRequest request) {
        return compare(ownerId, email, null, request);
    }

    public Map<String, Object> compareGuest(String guestSessionId, SimulationComparisonRequest request) {
        return compare(guestSessionId, null, guestSessionId, request);
    }

    private Map<String, Object> compare(
            String ownerId,
            String email,
            String guestSessionId,
            SimulationComparisonRequest request
    ) {
        if (request.analysisStart() != null && request.analysisEnd() != null
                && request.analysisStart().isAfter(request.analysisEnd())) {
            throw new IllegalArgumentException("analysisStart must not be after analysisEnd");
        }
        var references = request.simulationIds().stream().map(id -> {
            var simulation = simulations.get(ownerId, email, id);
            Map<String, Object> reference = new LinkedHashMap<>();
            reference.put("id", simulation.id());
            reference.put("name", simulation.name());
            reference.put("plantSimulation", simulation.plantSimulation());
            return reference;
        }).toList();
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("user_email", email);
        body.put("guest_session_id", guestSessionId);
        body.put("simulationIds", request.simulationIds());
        body.put("analysisStart", request.analysisStart() == null ? null : request.analysisStart().toString());
        body.put("analysisEnd", request.analysisEnd() == null ? null : request.analysisEnd().toString());
        body.put("references", references);
        return python.comparison(body);
    }
}
