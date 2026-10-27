package com.cozybench.building.controller;

import com.cozybench.building.dto.ComponentUpdateRequest;
import com.cozybench.building.model.type.ComponentCategory;
import com.cozybench.building.model.type.ComponentDomain;
import com.cozybench.building.model.type.ComponentTypePath;
import com.cozybench.building.service.workspace.WorkspaceComponentCoordinator;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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

    public BuildingComponentCommandController(WorkspaceComponentCoordinator coordinator) {
        this.coordinator = coordinator;
    }

    /** Creates an empty workspace object with the selected IDD record's defaults. */
    @PostMapping("/create")
    public ResponseEntity<Void> create(
            Authentication authentication,
            @RequestParam ComponentDomain domain,
            @RequestParam ComponentCategory category,
            @RequestParam String type
    ) {
        // The authenticated principal is the owner; the client only chooses the component type.
        coordinator.create(authentication.getName(), new ComponentTypePath(domain, category, type));
        return ResponseEntity.noContent().build();
    }

    /** Updates the selected workspace object using its explicit domain, category, and type. */
    @PutMapping("/update")
    public ResponseEntity<Void> update(
            Authentication authentication,
            @Valid @RequestBody ComponentUpdateRequest request
    ) {
        // @Valid checks the request envelope before domain-specific property validation runs.
        coordinator.update(authentication.getName(), request);
        return ResponseEntity.noContent().build();
    }

    /** Copies a workspace object into a new, independently named workspace object. */
    @PostMapping("/duplicate")
    public ResponseEntity<Void> duplicate(
            Authentication authentication,
            @RequestParam String id,
            @RequestParam ComponentDomain domain,
            @RequestParam ComponentCategory category,
            @RequestParam String type
    ) {
        coordinator.duplicate(authentication.getName(), id, new ComponentTypePath(domain, category, type));
        return ResponseEntity.noContent().build();
    }

    /** Imports the chosen library object and its required dependency graph. */
    @PostMapping("/add")
    public ResponseEntity<Void> addFromLibrary(
            Authentication authentication,
            @RequestParam String id,
            @RequestParam ComponentDomain domain,
            @RequestParam ComponentCategory category,
            @RequestParam String type
    ) {
        coordinator.addFromLibrary(authentication.getName(), id, new ComponentTypePath(domain, category, type));
        return ResponseEntity.noContent().build();
    }

    /** Deletes the authenticated user's selected object and clears known incoming references. */
    @DeleteMapping("/delete")
    public ResponseEntity<Void> delete(
            Authentication authentication,
            @RequestParam String id
    ) {
        coordinator.delete(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
