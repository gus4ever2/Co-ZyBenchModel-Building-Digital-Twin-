package com.cozybench.building.controller;

import com.cozybench.building.dto.ComponentStateResponse;
import com.cozybench.building.service.query.BuildingComponentQueryService;
import com.cozybench.guest.GuestSessionRecord;
import com.cozybench.guest.GuestSessionRegistry;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Read endpoints supplying the editor with workspace, library, and selected-item data. */
@RestController
@RequestMapping(value = "/api/building-dt/components", produces = "application/json")
public class BuildingComponentQueryController {

    private final BuildingComponentQueryService queryService;
    private final GuestSessionRegistry guestSessions;

    public BuildingComponentQueryController(
            BuildingComponentQueryService queryService,
            GuestSessionRegistry guestSessions
    ) {
        this.queryService = queryService;
        this.guestSessions = guestSessions;
    }

    /** Compatibility constructor for focused unit tests; HTTP wiring uses the session registry. */
    public BuildingComponentQueryController(BuildingComponentQueryService queryService) {
        this(queryService, new GuestSessionRegistry());
    }

    /** Loads editor options and an optional selected Material. */
    @GetMapping("/loadMaterialsData")
    public ComponentStateResponse materials(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") String id,
            @RequestParam(defaultValue = "MATERIAL") String type
    ) {
        return queryService.loadByType(ownerId(request), type, id);
    }

    /** Loads constructions and the Materials that can fill their layer fields. */
    @GetMapping("/loadConstructionsData")
    public ComponentStateResponse constructions(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") String id,
            @RequestParam(defaultValue = "CONSTRUCTION") String type
    ) {
        return queryService.loadByType(ownerId(request), type, id);
    }

    /** Loads construction sets and the Constructions assignable to their slots. */
    @GetMapping("/loadConstructionSetsData")
    public ComponentStateResponse constructionSets(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") String id,
            @RequestParam(defaultValue = "CONSTRUCTION_SET") String type
    ) {
        return queryService.loadByType(ownerId(request), type, id);
    }

    /** Compatibility overload for callers that used the old public-catalog helper. */
    public ComponentStateResponse constructionSets(HttpServletRequest ignored, String id) {
        return queryService.constructionSets("__guest_public_catalog__", id);
    }

    private String ownerId(HttpServletRequest request) {
        Object value = request.getAttribute(GuestSessionRegistry.REQUEST_ATTRIBUTE);
        if (value instanceof GuestSessionRecord record) return record.guestSessionId();
        return guestSessions.getOrCreate(request.getSession(true)).guestSessionId();
    }
}
