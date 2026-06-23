package com.example.cozybench.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cozybench.model.Scenario;
import com.example.cozybench.service.ScenarioService;


@RestController
@RequestMapping("/api/scenarios")
public class ScenarioController {
    private final ScenarioService scenarioService;

    public ScenarioController(ScenarioService scenarioService) {
        this.scenarioService = scenarioService;
    }

    @PostMapping
    public ResponseEntity<Scenario> createScenario(@RequestBody Scenario scenario) {
        Scenario createdScenario = scenarioService.createScenario(scenario);
        return ResponseEntity.ok(createdScenario);
    }

    @GetMapping("/all")
    public List<Scenario> getAllScenarios() {
        return scenarioService.getAllScenarios();
    }

    @GetMapping("/{id}")
    public Scenario getScenarioById(@PathVariable String id) {
        return scenarioService.fetchScenarioById(id);
    }
    
    
}

