package com.example.cozybench.service;

import java.util.List;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.cozybench.model.Scenario;
import com.example.cozybench.repository.ScenarioRepository;

@Service
public class ScenarioService {
    private final RestTemplate restTemplate;
    private static final String PYTHON_SERVER_URL = "http://localhost:5000";
    private final ScenarioRepository scenarioRepository;


    public ScenarioService(RestTemplateBuilder builder, ScenarioRepository scenarioRepository) {
        this.restTemplate = builder.build();
        this.scenarioRepository = scenarioRepository;
    }


    public Scenario createScenario(Scenario scenario) {
        return scenarioRepository.save(scenario);
    }

    public List<Scenario> getAllScenarios() {
        return scenarioRepository.findAll();
    }

    public Scenario fetchScenarioById(String id) {
        return scenarioRepository.findById(id).orElse(null);
    }

}

