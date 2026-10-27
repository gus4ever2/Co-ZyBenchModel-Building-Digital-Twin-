package com.cozybench.building.controller;

import com.cozybench.building.dto.ComponentStateResponse;
import com.cozybench.building.service.query.BuildingComponentQueryService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Read endpoints supplying the editor with workspace, library, and selected-item data. */
@RestController
@RequestMapping(value = "/api/building-dt/components", produces = "application/json")
public class BuildingComponentQueryController {

    private final BuildingComponentQueryService queryService;

    public BuildingComponentQueryController(BuildingComponentQueryService queryService) {
        this.queryService = queryService;
    }

    /** Loads editor options and an optional selected Material. */
    @GetMapping("/loadMaterialsData")
    public ComponentStateResponse materials(
            Authentication authentication,
            @RequestParam(defaultValue = "0") String id
    ) {
        return queryService.materials(authentication.getName(), id);
    }

    /** Loads constructions and the Materials that can fill their layer fields. */
    @GetMapping("/loadConstructionsData")
    public ComponentStateResponse constructions(
            Authentication authentication,
            @RequestParam(defaultValue = "0") String id
    ) {
        return queryService.constructions(authentication.getName(), id);
    }

    /** Loads construction sets and the Constructions assignable to their slots. */
    @GetMapping("/loadConstructionSetsData")
    public ComponentStateResponse constructionSets(
            Authentication authentication,
            @RequestParam(defaultValue = "0") String id
    ) {
        return queryService.constructionSets(authentication.getName(), id);
    }
}
