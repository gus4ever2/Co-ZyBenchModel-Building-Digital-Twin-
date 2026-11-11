package com.cozybench.building;

import com.cozybench.building.controller.BuildingComponentQueryController;
import com.cozybench.building.service.query.BuildingComponentQueryService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BuildingComponentQueryControllerTests {

    @Test
    void anonymousConstructionSetRequestUsesPublicCatalogOwner() {
        BuildingComponentQueryService queries = mock(BuildingComponentQueryService.class);
        when(queries.constructionSets("__guest_public_catalog__", "0"))
                .thenReturn(null);
        BuildingComponentQueryController controller =
                new BuildingComponentQueryController(queries);

        assertNull(controller.constructionSets(null, "0"));
        verify(queries).constructionSets("__guest_public_catalog__", "0");
    }
}
