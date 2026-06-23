package com.example.cozybench.model.enums;

import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class CollectionNameMapper {

    public static final Map<String, String> TYPE_TO_COLLECTION = new HashMap<>();

    static {
        // Materials
        TYPE_TO_COLLECTION.put("MATERIAL", "material");
        TYPE_TO_COLLECTION.put("MATERIAL_NO_MASS", "material");
        TYPE_TO_COLLECTION.put("MATERIAL_AIR_GAP", "material");
        TYPE_TO_COLLECTION.put("MATERIAL_INFRARED_TRANSPARENT", "material");
        TYPE_TO_COLLECTION.put("MATERIAL_ROOF_VEGETATION", "material");

        // Window Materials
        TYPE_TO_COLLECTION.put("WINDOW_MATERIAL_SIMPLE_GLAZING_SYSTEM", "windowMaterial");
        TYPE_TO_COLLECTION.put("WINDOW_MATERIAL_GLAZING", "windowMaterial");
        TYPE_TO_COLLECTION.put("WINDOW_MATERIAL_GAS", "windowMaterial");
        TYPE_TO_COLLECTION.put("WINDOW_MATERIAL_GAS_MIXTURE", "windowMaterial");
        TYPE_TO_COLLECTION.put("WINDOW_MATERIAL_BLIND", "windowMaterial");
        TYPE_TO_COLLECTION.put("WINDOW_MATERIAL_DAYLIGHT_REDIRECTION_DEVICE", "windowMaterial");
        TYPE_TO_COLLECTION.put("WINDOW_MATERIAL_SCREEN", "windowMaterial");
        TYPE_TO_COLLECTION.put("WINDOW_MATERIAL_SHADE", "windowMaterial");
        TYPE_TO_COLLECTION.put("WINDOW_MATERIAL_GLAZING_REFRACTION_EXTINCTION_METHOD", "windowMaterial");

        // Constructions
        TYPE_TO_COLLECTION.put("CONSTRUCTION", "construction");
        TYPE_TO_COLLECTION.put("CONSTRUCTION_AIR_BOUNDARY", "construction");
        TYPE_TO_COLLECTION.put("CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE", "construction");
        TYPE_TO_COLLECTION.put("CONSTRUCTION_CFACTOR_UNDERGROUND_WALL", "construction");
        TYPE_TO_COLLECTION.put("CONSTRUCTION_FFACTOR_GROUND_FLOOR", "construction");

        // Construction Set
        TYPE_TO_COLLECTION.put("CONSTRUCTION_SET", "constructionSet");

        // Loads / Space Type components
        TYPE_TO_COLLECTION.put("PEOPLE", "spaceType");
        TYPE_TO_COLLECTION.put("LIGHTS", "spaceType");
        TYPE_TO_COLLECTION.put("ELECTRIC_EQUIPMENT", "spaceType");
        TYPE_TO_COLLECTION.put("GAS_EQUIPMENT", "spaceType");
        TYPE_TO_COLLECTION.put("STEAM_EQUIPMENT", "spaceType");
        TYPE_TO_COLLECTION.put("OTHER_EQUIPMENT", "spaceType");
        TYPE_TO_COLLECTION.put("INTERNAL_MASS", "spaceType");
        TYPE_TO_COLLECTION.put("WATER_USE_EQUIPMENT", "spaceType");

        // Simulation
        TYPE_TO_COLLECTION.put("RUN_PERIOD_AND_TIMESTEP", "simulations");
        TYPE_TO_COLLECTION.put("RUN_PERIOD", "simulations");
        TYPE_TO_COLLECTION.put("TIMESTEP", "simulations");

        // Plant
        TYPE_TO_COLLECTION.put("PLANT_YPLANT_QMC_CO2_SIMULATION", "plant");
    }

    public static String getCollectionName(String enumValue) {
        String collectionName = TYPE_TO_COLLECTION.get(enumValue);

        if (collectionName == null) {
            throw new IllegalArgumentException("No collection mapped for enum value: " + enumValue);
        }

        return collectionName;
    }
}
