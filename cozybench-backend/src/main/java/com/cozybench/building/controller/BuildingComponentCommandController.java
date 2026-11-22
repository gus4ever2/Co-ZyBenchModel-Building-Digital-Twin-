package com.cozybench.building.controller;

import com.cozybench.building.dto.ComponentUpdateRequest;
import com.cozybench.building.service.workspace.WorkspaceComponentCoordinator;
import com.cozybench.guest.GuestSessionRecord;
import com.cozybench.guest.GuestSessionRegistry;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** HTTP commands for creating, editing, copying, importing, and removing workspace components. */
@RestController
@RequestMapping(value = "/api/building-dt/components", produces = "application/json")
public class BuildingComponentCommandController {

    private final WorkspaceComponentCoordinator coordinator;
    private final GuestSessionRegistry guestSessions;

    public BuildingComponentCommandController(
            WorkspaceComponentCoordinator coordinator,
            GuestSessionRegistry guestSessions
    ) {
        this.coordinator = coordinator;
        this.guestSessions = guestSessions;
    }

    /** Creates an empty workspace object with the selected IDD record's defaults. */
    @PostMapping("/create")
    public ResponseEntity<Void> create(
            HttpServletRequest request,
            @RequestParam String type
    ) {
        coordinator.create(ownerId(request), type);
        return ResponseEntity.noContent().build();
    }

    /** Updates the selected workspace object using its canonical type. */
    @PutMapping("/update")
    public ResponseEntity<Void> update(
            HttpServletRequest httpRequest,
            @Valid @RequestBody ComponentUpdateRequest request
    ) {
        // @Valid checks the request envelope before domain-specific property validation runs.
        coordinator.update(ownerId(httpRequest), request);
        return ResponseEntity.noContent().build();
    }

    /** Copies a workspace object into a new, independently named workspace object. */
    @PostMapping("/duplicate")
    public ResponseEntity<Void> duplicate(
            HttpServletRequest request,
            @RequestParam String id,
            @RequestParam String type
    ) {
        coordinator.duplicate(ownerId(request), id, type);
        return ResponseEntity.noContent().build();
    }

    /** Imports the chosen library object and its required dependency graph. */
    @PostMapping("/add")
    public ResponseEntity<Void> addFromLibrary(
            HttpServletRequest request,
            @RequestParam String id,
            @RequestParam String type
    ) {
        coordinator.addFromLibrary(ownerId(request), id, type);
        return ResponseEntity.noContent().build();
    }

    /** Deletes the current session's selected object and clears known incoming references. */
    @DeleteMapping("/delete")
    public ResponseEntity<Void> delete(
            HttpServletRequest request,
            @RequestParam String id
    ) {
        coordinator.delete(ownerId(request), id);
        return ResponseEntity.noContent().build();
    }

    private String ownerId(HttpServletRequest request) {
        Object value = request.getAttribute(GuestSessionRegistry.REQUEST_ATTRIBUTE);
        if (value instanceof GuestSessionRecord record) return record.guestSessionId();
        return guestSessions.getOrCreate(request.getSession(true)).guestSessionId();
    }
}
