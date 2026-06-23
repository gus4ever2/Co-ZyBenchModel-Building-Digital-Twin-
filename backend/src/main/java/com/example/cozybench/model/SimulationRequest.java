package com.example.cozybench.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

import java.util.LinkedHashMap;

@Builder
public record SimulationRequest(
        @JsonProperty("scenario_id")
        String scenarioId,
        String building,
        String constructionSet,
        LinkedHashMap<String, String> assignSpaceTypes,
        String environment,
        String hvacSystem,
        String userEmail) {
    //private String occupantType;

}
