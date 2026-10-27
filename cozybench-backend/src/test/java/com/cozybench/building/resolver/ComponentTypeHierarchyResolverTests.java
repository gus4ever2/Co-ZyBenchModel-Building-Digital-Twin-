package com.cozybench.building.resolver;

import com.cozybench.building.model.type.ComponentCategory;
import com.cozybench.building.model.type.ComponentDomain;
import com.cozybench.building.model.type.ComponentTypePath;
import com.cozybench.building.model.type.ConstructionType;
import com.cozybench.building.model.type.MaterialType;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ComponentTypeHierarchyResolverTests {

    private final ComponentTypeHierarchyResolver resolver = new ComponentTypeHierarchyResolver();

    @Test
    void resolvesAConcreteMaterialFromItsExplicitPath() {
        var path = new ComponentTypePath(
                ComponentDomain.CONSTRUCTIONS, ComponentCategory.MATERIAL, "MATERIAL_NO_MASS");

        assertEquals(MaterialType.MATERIAL_NO_MASS, resolver.resolve(path));
    }

    @Test
    void rejectsATypeThatDoesNotBelongToTheSelectedCategory() {
        var path = new ComponentTypePath(
                ComponentDomain.CONSTRUCTIONS, ComponentCategory.MATERIAL, "CONSTRUCTION");

        assertThrows(IllegalArgumentException.class, () -> resolver.resolve(path));
    }

    @Test
    void resolvesAConstructionIndependentlyOfMaterialTypes() {
        var path = new ComponentTypePath(
                ComponentDomain.CONSTRUCTIONS, ComponentCategory.CONSTRUCTION, "CONSTRUCTION");

        assertEquals(ConstructionType.CONSTRUCTION, resolver.resolve(path));
    }
}
