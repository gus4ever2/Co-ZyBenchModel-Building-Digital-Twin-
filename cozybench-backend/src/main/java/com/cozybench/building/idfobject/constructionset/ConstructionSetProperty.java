package com.cozybench.building.idfobject.constructionset;

/** Construction-set slots whose values point to Construction objects. */
public enum ConstructionSetProperty {
    EXTERIOR_WALL("exteriorWall"),
    EXTERIOR_FLOOR("exteriorFloor"),
    EXTERIOR_ROOF("exteriorRoof"),
    INTERIOR_WALL("interiorWall"),
    INTERIOR_FLOOR("interiorFloor"),
    INTERIOR_CEILING("interiorCeiling"),
    GROUND_CONTACT_WALL("groundContactWall"),
    GROUND_CONTACT_FLOOR("groundContactFloor"),
    GROUND_CONTACT_CEILING("groundContactCeiling"),
    EXTERIOR_FIXED_WINDOW("exteriorFixedWindow"),
    EXTERIOR_OPERABLE_WINDOW("exteriorOperableWindow"),
    EXTERIOR_DOOR("exteriorDoor"),
    EXTERIOR_GLASS_DOOR("exteriorGlassDoor"),
    EXTERIOR_OVERHEAD_DOOR("exteriorOverheadDoor"),
    EXTERIOR_SKYLIGHT("exteriorSkylight"),
    EXTERIOR_TUBULAR_DAYLIGHT_DOME("exteriorTubularDaylightDome"),
    EXTERIOR_TUBULAR_DAYLIGHT_DIFFUSER("exteriorTubularDaylightDiffuser"),
    INTERIOR_FIXED_WINDOW("interiorFixedWindow"),
    INTERIOR_OPERABLE_WINDOW("interiorOperableWindow"),
    INTERIOR_DOOR("interiorDoor"),
    SPACE_SHADING("spaceShading"),
    BUILDING_SHADING("buildingShading"),
    SITE_SHADING("siteShading"),
    INTERIOR_PARTITION("interiorPartition"),
    ADIABATIC_SURFACE("adiabaticSurface");

    private final String fieldName;

    ConstructionSetProperty(String fieldName) {
        this.fieldName = fieldName;
    }

    public String fieldName() {
        return fieldName;
    }
}
