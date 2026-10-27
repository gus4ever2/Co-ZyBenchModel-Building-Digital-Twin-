package com.cozybench.building.factory;

import com.cozybench.building.idfobject.construction.AirBoundary;
import com.cozybench.building.idfobject.construction.CfactorUndergroundWall;
import com.cozybench.building.idfobject.construction.FfactorGroundFloor;
import com.cozybench.building.idfobject.construction.InternalHeatSource;
import com.cozybench.building.idfobject.construction.LayeredConstruction;
import com.cozybench.building.model.type.ComponentCategory;
import com.cozybench.building.model.type.ComponentType;
import com.cozybench.building.model.type.ConstructionType;
import jakarta.validation.Validator;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

/** Creates property factories for EnergyPlus construction objects. */
@Component
public final class ConstructionFactory extends AbstractComponentCategoryFactory {
    private final Map<ComponentType, ComponentFactory> definitions;

    public ConstructionFactory(Validator validator) {
        super(validator);
        Map<ComponentType, ComponentFactory> values = new LinkedHashMap<>();
        values.put(ConstructionType.CONSTRUCTION, definition(
                ConstructionType.CONSTRUCTION, LayeredConstruction.class));
        values.put(ConstructionType.CONSTRUCTION_AIR_BOUNDARY, definition(
                ConstructionType.CONSTRUCTION_AIR_BOUNDARY, AirBoundary.class));
        values.put(ConstructionType.CONSTRUCTION_CFACTOR_UNDERGROUND_WALL, definition(
                ConstructionType.CONSTRUCTION_CFACTOR_UNDERGROUND_WALL, CfactorUndergroundWall.class));
        values.put(ConstructionType.CONSTRUCTION_FFACTOR_GROUND_FLOOR, definition(
                ConstructionType.CONSTRUCTION_FFACTOR_GROUND_FLOOR, FfactorGroundFloor.class));
        values.put(ConstructionType.CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE, definition(
                ConstructionType.CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE, InternalHeatSource.class));
        this.definitions = Map.copyOf(values);
    }

    @Override
    public ComponentCategory category() {
        return ComponentCategory.CONSTRUCTION;
    }

    @Override
    protected Map<ComponentType, ComponentFactory> definitions() {
        return definitions;
    }
}
