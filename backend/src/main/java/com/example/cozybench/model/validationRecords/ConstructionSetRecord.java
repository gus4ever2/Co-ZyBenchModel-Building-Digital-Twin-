package com.example.cozybench.model.validationRecords;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.util.Map;

@Builder
public record ConstructionSetRecord(
        @NotBlank
        String Name,

        String exteriorWall,
        String exteriorFloor,
        String exteriorRoof,

        String interiorWall,
        String interiorFloor,
        String interiorCeiling,

        String groundContactWall,
        String groundContactFloor,
        String groundContactCeiling,

        String exteriorFixedWindow,
        String exteriorOperableWindow,
        String exteriorDoor,
        String exteriorGlassDoor,
        String exteriorOverheadDoor,
        String exteriorSkylight,
        String exteriorTubularDaylightDome,
        String exteriorTubularDaylightDiffuser,

        String interiorFixedWindow,
        String interiorOperableWindow,
        String interiorDoor,

        String spaceShading,
        String buildingShading,
        String siteShading,

        String interiorPartition,
        String adiabaticSurface
) implements IdfObjectRecord {}
