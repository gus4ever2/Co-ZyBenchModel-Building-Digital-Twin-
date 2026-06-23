package com.example.cozybench.model;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;



@Document(collection = "simulations")
public class Simulation {

    @Id
    private String id;

    @DBRef
    private User user;
    @Enumerated(EnumType.STRING)
    private SimulationStatus status;
    private String scenario_id;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private Date start_time;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private Date end_time;
    private Date estimated_completion_time;
    private double progress;
    private List<Map<String, Object>> results = new ArrayList<>();

    public List<Map<String, Object>> getResults() {
        return results;
    }

    public void setResults(List<Map<String, Object>> results) {
        this.results = results;
    }

    public Simulation() {}

    // Constructeur avec tous les paramètres
    public Simulation(String scenarioId, SimulationStatus status, Date startTime, Date endTime,
    Date estimatedCompletionTime) {
        this.scenario_id = scenarioId;
        this.status = status;
        this.start_time = startTime;
        this.estimated_completion_time = estimatedCompletionTime;
        this.progress = 0.0; // Initialisation de la progression à 0%
    }

    // Getters et setters
    public String getId() {
        return id;
    }

    public void setId(String id1) {
        this.id = id1;
    }

    // public User getUser() {
    //     return user;
    // }

    // public void setUser(User user) {
    //     this.user = user;
    // }


    public SimulationStatus getStatus() {
        return status;
    }

    public void setStatus(SimulationStatus status) {
        this.status = status;
    }

    public Date getStartTime() {
        return start_time;
    }

    public void setStartTime(Date startTime) {
        this.start_time = startTime;
    }

    public Date getEndTime() {
        return end_time;
    }

    public void setEndTime(Date endTime) {
        this.end_time = endTime;
    }

    public Date getEstimatedCompletionTime() {
        return estimated_completion_time;
    }

    public void setEstimatedCompletionTime(Date estimatedCompletionTime) {
        this.estimated_completion_time = estimatedCompletionTime;
    }

    public double getProgress() {
        return progress;
    }

    public void setProgress(double progress) {
        this.progress = progress;
    }

    public String getScenarioId() {
        return scenario_id;
    }

    public void setScenarioId(String scenarioId) {
        this.scenario_id = scenarioId;
    }


}
