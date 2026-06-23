package com.example.cozybench.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SimulationResponse {

    @JsonProperty("simulation_id")
    private String  simulationId;

    @JsonProperty("status")
    private SimulationStatus status;
    
    @JsonProperty("estimated_completion_time")
    private LocalDateTime estimatedCompletionTime;

    public String getsimulationId() {
        return simulationId;
    }

    public void setsimulationId(String simulation_Id) {
        this.simulationId = simulation_Id;
    }

    public SimulationStatus getStatus() {
        return status;
    }

    public void setStatus(SimulationStatus status) {
        this.status = status;
    }

    public LocalDateTime getEstimatedCompletionTime() {
        return estimatedCompletionTime;
    }

    public void setEstimatedCompletionTime(LocalDateTime estimatedCompletionTime) {
        this.estimatedCompletionTime = estimatedCompletionTime;
    }


}
