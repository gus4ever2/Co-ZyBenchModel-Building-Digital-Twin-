package com.example.cozybench.service;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.example.cozybench.dto.SimulationWithScenario;
import com.example.cozybench.model.Scenario;
import com.example.cozybench.model.Simulation;
import com.example.cozybench.model.SimulationRequest;
import com.example.cozybench.model.SimulationResponse;
import com.example.cozybench.model.SimulationResult;
import com.example.cozybench.model.SimulationStatus;
import com.example.cozybench.repository.ScenarioRepository;
import com.example.cozybench.repository.SimulationRepository;

@Service
@RequiredArgsConstructor
public class SimulationService {
    private final RestTemplate restTemplate;
    private final SimulationRepository simulationRepository;
    private final ScenarioRepository scenarioRepository;
    @Getter
    private static final String PYTHON_SERVER_URL = "http://localhost:5000";

    public SimulationResponse startSimulation(SimulationRequest request, MultipartFile pythonFile) {
        String url = PYTHON_SERVER_URL + "/start-simulation";// URL de l'application Python
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        // Inclure le scenario_id dans la requête
        //HttpEntity<SimulationRequest> entity = new HttpEntity<>(request, headers);
        //ResponseEntity<SimulationResponse> response = restTemplate.exchange(url, HttpMethod.POST, entity, SimulationResponse.class);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("building", request.building());
        body.add("constructionSet", request.constructionSet());
        body.add("userEmail", request.userEmail());
        body.add("environment", request.environment());
        body.add("hvacSystem", request.hvacSystem());
        body.add("scenarioId", request.scenarioId());

        // Add the Python file to the request
        if (pythonFile != null) {
            try {
                body.add("pythonFile", new org.springframework.core.io.ByteArrayResource(pythonFile.getBytes()) {
                    @Override
                    public String getFilename() {
                        return pythonFile.getOriginalFilename();
                    }
                });
            } catch (IOException e) {
                throw new RuntimeException("Failed to process uploaded Python file", e);
            }
        }

        HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<SimulationResponse> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                SimulationResponse.class
        );

        if (response.getStatusCode() == HttpStatus.CREATED) {
            return response.getBody();
        } else {
            throw new RuntimeException("Failed to start simulation in Python backend");
        }
    }


    public List<Simulation> getAllSimulations() {
        return simulationRepository.findAll();
    }

    public SimulationStatus getSimulationStatus(int simulationId) {
        String url = PYTHON_SERVER_URL + "/simulation-status/" + simulationId;
        return restTemplate.getForObject(url, SimulationStatus.class);
    }

    public double getSimulationProgress(int simulationId) {
        String url = PYTHON_SERVER_URL + "/simulation-progress/" + simulationId;
        return restTemplate.getForObject(url, Double.class);
    }

    public Optional<SimulationResult> getSimulationResults(String simulationId) {
        String url = PYTHON_SERVER_URL + "/simulation-results/" + simulationId;
        SimulationResult result = restTemplate.getForObject(url, SimulationResult.class);
        return Optional.ofNullable(result);
    }

    public Simulation saveSimulation(Simulation simulation) {
        return simulationRepository.save(simulation);
    }

    public Optional<Simulation> getSimulationById(String id) {
        return simulationRepository.findById(id);
    }

    public List<Simulation> getSimulationsByStatus(SimulationStatus status) {
        return simulationRepository.findByStatus(status);
    }

    public List<SimulationWithScenario> getSimulationsWithScenarios(List<String> simulationIds) {
        List<Simulation> simulations = simulationRepository.findAllById(simulationIds);
        List<SimulationWithScenario> simulationsWithScenarios = new ArrayList<>();

        for (Simulation simulation : simulations) {
            Scenario scenario = scenarioRepository.findById(simulation.getScenarioId()).orElse(null);
            simulationsWithScenarios.add(new SimulationWithScenario(simulation, scenario));
        }

        return simulationsWithScenarios;
    }

}
