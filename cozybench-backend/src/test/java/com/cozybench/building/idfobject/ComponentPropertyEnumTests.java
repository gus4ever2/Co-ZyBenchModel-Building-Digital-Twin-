package com.cozybench.building.idfobject;

import com.cozybench.building.idfobject.construction.ConstructionLayerProperty;
import com.cozybench.building.idfobject.construction.InternalHeatSource;
import com.cozybench.building.idfobject.construction.InternalHeatSourceProperty;
import com.cozybench.building.idfobject.construction.LayeredConstruction;
import com.cozybench.building.idfobject.constructionset.ConstructionSet;
import com.cozybench.building.idfobject.constructionset.ConstructionSetProperty;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ComponentPropertyEnumTests {

    @Test
    void constructionLayerEnumMatchesTheIddRecordFieldsInOrder() {
        assertEquals(recordFields(LayeredConstruction.class),
                Arrays.stream(ConstructionLayerProperty.values())
                        .map(ConstructionLayerProperty::fieldName).toList());
    }

    @Test
    void constructionSetEnumMatchesTheIddRecordFieldsInOrder() {
        assertEquals(recordFields(ConstructionSet.class),
                Arrays.stream(ConstructionSetProperty.values())
                        .map(ConstructionSetProperty::fieldName).toList());
    }

    @Test
    void internalHeatSourceEnumIdentifiesItsConstructionField() {
        assertEquals(List.of("Construction_Name"),
                Arrays.stream(InternalHeatSourceProperty.values())
                        .map(InternalHeatSourceProperty::fieldName).toList());
        assertEquals("Construction_Name", Arrays.stream(InternalHeatSource.class.getRecordComponents())
                .map(component -> component.getName())
                .filter("Construction_Name"::equals)
                .findFirst().orElseThrow());
    }

    private List<String> recordFields(Class<?> recordType) {
        return Arrays.stream(recordType.getRecordComponents())
                .map(component -> component.getName())
                .filter(name -> !"Name".equals(name))
                .toList();
    }
}
