package com.example.cozybench.model;

import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "scenarios")
@Builder
public record Scenario (
    @Id
    String id,
    String building,
    String constructionSet,
    String envConditions,
    String hvacSystem
    )
    //private String occupantType;
    //private String rule;
{}
