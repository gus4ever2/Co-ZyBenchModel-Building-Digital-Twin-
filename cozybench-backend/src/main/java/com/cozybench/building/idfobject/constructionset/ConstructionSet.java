package com.cozybench.building.idfobject.constructionset;

import com.cozybench.building.model.validation.IddPropertiesRecord;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

/** Application-level construction-set references; it is grouped with IDF objects for one discoverable catalog. */
@Builder
public record ConstructionSet(
        @NotBlank String Name,
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
) implements IddPropertiesRecord {
}
