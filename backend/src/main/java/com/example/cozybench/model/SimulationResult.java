package com.example.cozybench.model;

public class SimulationResult {
    private int simulationId;
    private double energyConsumption;
    private double thermalComfortScore;
    private double carbonEmission;
    private double performanceScore;

    // Getters et setters
    public int getSimulationId() {
        return simulationId;
    }

    public void setSimulationId(int simulationId) {
        this.simulationId = simulationId;
    }

    public double getEnergyConsumption() {
        return energyConsumption;
    }

    public void setEnergyConsumption(double energyConsumption) {
        this.energyConsumption = energyConsumption;
    }

    public double getThermalComfortScore() {
        return thermalComfortScore;
    }

    public void setThermalComfortScore(double thermalComfortScore) {
        this.thermalComfortScore = thermalComfortScore;
    }

    public double getCarbonEmission() {
        return carbonEmission;
    }

    public void setCarbonEmission(double carbonEmission) {
        this.carbonEmission = carbonEmission;
    }

    public double getPerformanceScore() {
        return performanceScore;
    }

    public void setPerformanceScore(double performanceScore) {
        this.performanceScore = performanceScore;
    }
}
