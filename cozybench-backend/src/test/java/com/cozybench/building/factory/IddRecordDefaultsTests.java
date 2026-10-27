package com.cozybench.building.factory;

import com.cozybench.building.idfobject.material.Material;
import com.cozybench.building.idfobject.material.RoofVegetation;
import com.cozybench.building.idfobject.material.SimpleGlazingSystem;
import com.cozybench.building.model.type.MaterialType;
import com.cozybench.building.model.type.WindowMaterialType;
import jakarta.validation.Validation;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class IddRecordDefaultsTests {

    @Test
    void builderUsesRecordDefaultsForOmittedFields() {
        Material material = Material.builder().Name("Wall").build();
        SimpleGlazingSystem glazing = SimpleGlazingSystem.builder().Name("Window").build();
        RoofVegetation vegetation = RoofVegetation.builder().Name("Roof").build();

        assertEquals("MediumRough", material.Roughness());
        assertEquals(0.1, material.Thickness());
        assertEquals(2.7, glazing.U_Factor());
        assertEquals(0.4, glazing.Solar_Heat_Gain_Coefficient());
        assertEquals(0.2, vegetation.Height_of_Plants());
        assertEquals("Advanced", vegetation.Moisture_Diffusion_Calculation_Method());
    }

    @Test
    void categoryFactoryCreatesAllMaterialTypesWithRecordDefaults() {
        try (ValidatorFactory validatorFactory = Validation.buildDefaultValidatorFactory()) {
            MaterialFactory factory = new MaterialFactory(validatorFactory.getValidator());

            for (MaterialType type : MaterialType.values()) {
                assertEquals("Wall", factory.create(type).createDefault("Wall").toProperties().get("Name"));
            }
            for (WindowMaterialType type : WindowMaterialType.values()) {
                assertEquals("Window", factory.create(type).createDefault("Window").toProperties().get("Name"));
            }

            assertEquals("0.1", factory.create(MaterialType.MATERIAL)
                    .createDefault("Wall").toProperties().get("Thickness"));
            assertEquals("2.7", factory.create(WindowMaterialType.WINDOW_MATERIAL_SIMPLE_GLAZING_SYSTEM)
                    .createDefault("Window").toProperties().get("U_Factor"));
        }
    }
}
