package com.example.cozybench.dto;

import com.example.cozybench.model.Scenario;
import com.example.cozybench.model.Simulation;

public class SimulationWithScenario {
    private Simulation simulation;
    private Scenario scenario;

    public SimulationWithScenario(Simulation simulation, Scenario scenario) {
        this.simulation = simulation;
        this.scenario = scenario;
    }

    // Getters and setters
    public Simulation getSimulation() {
        return simulation;
    }

    public void setSimulation(Simulation simulation) {
        this.simulation = simulation;
    }

    public Scenario getScenario() {
        return scenario;
    }

    public void setScenario(Scenario scenario) {
        this.scenario = scenario;
    }
}
