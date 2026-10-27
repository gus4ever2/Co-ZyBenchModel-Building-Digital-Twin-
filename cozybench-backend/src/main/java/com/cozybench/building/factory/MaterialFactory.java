package com.cozybench.building.factory;

import com.cozybench.building.idfobject.material.AirGap;
import com.cozybench.building.idfobject.material.Blind;
import com.cozybench.building.idfobject.material.Gas;
import com.cozybench.building.idfobject.material.GasMixture;
import com.cozybench.building.idfobject.material.Glazing;
import com.cozybench.building.idfobject.material.GlazingRefractionExtinctionMethod;
import com.cozybench.building.idfobject.material.InfraredTransparent;
import com.cozybench.building.idfobject.material.Material;
import com.cozybench.building.idfobject.material.NoMass;
import com.cozybench.building.idfobject.material.RoofVegetation;
import com.cozybench.building.idfobject.material.Screen;
import com.cozybench.building.idfobject.material.Shade;
import com.cozybench.building.idfobject.material.SimpleGlazingSystem;
import com.cozybench.building.model.type.ComponentCategory;
import com.cozybench.building.model.type.ComponentType;
import com.cozybench.building.model.type.MaterialType;
import com.cozybench.building.model.type.WindowMaterialType;
import jakarta.validation.Validator;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

/** Maps each opaque or fenestration type to its own IDD record and reflective factory. */
@Component
public final class MaterialFactory extends AbstractComponentCategoryFactory {
    private final Map<ComponentType, ComponentFactory> definitions;

    public MaterialFactory(Validator validator) {
        super(validator);
        Map<ComponentType, ComponentFactory> values = new LinkedHashMap<>();
        values.put(MaterialType.MATERIAL, definition(MaterialType.MATERIAL, Material.class));
        values.put(MaterialType.MATERIAL_NO_MASS, definition(MaterialType.MATERIAL_NO_MASS, NoMass.class));
        values.put(MaterialType.MATERIAL_AIR_GAP, definition(MaterialType.MATERIAL_AIR_GAP, AirGap.class));
        values.put(MaterialType.MATERIAL_INFRARED_TRANSPARENT, definition(
                MaterialType.MATERIAL_INFRARED_TRANSPARENT, InfraredTransparent.class));
        values.put(MaterialType.MATERIAL_ROOF_VEGETATION, definition(
                MaterialType.MATERIAL_ROOF_VEGETATION, RoofVegetation.class));
        values.put(WindowMaterialType.WINDOW_MATERIAL_SIMPLE_GLAZING_SYSTEM, definition(
                WindowMaterialType.WINDOW_MATERIAL_SIMPLE_GLAZING_SYSTEM, SimpleGlazingSystem.class));
        values.put(WindowMaterialType.WINDOW_MATERIAL_GLAZING, definition(
                WindowMaterialType.WINDOW_MATERIAL_GLAZING, Glazing.class));
        values.put(WindowMaterialType.WINDOW_MATERIAL_GLAZING_REFRACTION_EXTINCTION_METHOD, definition(
                WindowMaterialType.WINDOW_MATERIAL_GLAZING_REFRACTION_EXTINCTION_METHOD,
                GlazingRefractionExtinctionMethod.class));
        values.put(WindowMaterialType.WINDOW_MATERIAL_GAS, definition(
                WindowMaterialType.WINDOW_MATERIAL_GAS, Gas.class));
        values.put(WindowMaterialType.WINDOW_MATERIAL_GAS_MIXTURE, definition(
                WindowMaterialType.WINDOW_MATERIAL_GAS_MIXTURE, GasMixture.class));
        values.put(WindowMaterialType.WINDOW_MATERIAL_SHADE, definition(
                WindowMaterialType.WINDOW_MATERIAL_SHADE, Shade.class));
        values.put(WindowMaterialType.WINDOW_MATERIAL_BLIND, definition(
                WindowMaterialType.WINDOW_MATERIAL_BLIND, Blind.class));
        values.put(WindowMaterialType.WINDOW_MATERIAL_SCREEN, definition(
                WindowMaterialType.WINDOW_MATERIAL_SCREEN, Screen.class));
        this.definitions = Map.copyOf(values);
    }

    @Override
    public ComponentCategory category() {
        return ComponentCategory.MATERIAL;
    }

    @Override
    protected Map<ComponentType, ComponentFactory> definitions() {
        return definitions;
    }
}
