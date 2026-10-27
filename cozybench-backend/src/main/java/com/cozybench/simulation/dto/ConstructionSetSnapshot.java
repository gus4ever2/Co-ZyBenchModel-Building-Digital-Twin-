package com.cozybench.simulation.dto;

import java.util.List;

public record ConstructionSetSnapshot(
        ComponentSnapshot constructionSet,
        List<ComponentSnapshot> constructions,
        List<ComponentSnapshot> materials
) {
    public ConstructionSetSnapshot {
        constructions = constructions == null ? List.of() : List.copyOf(constructions);
        materials = materials == null ? List.of() : List.copyOf(materials);
    }
}
