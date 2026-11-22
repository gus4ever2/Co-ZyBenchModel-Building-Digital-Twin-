package com.cozybench.plant.controller;

import com.cozybench.plant.dto.PlantListResponse;
import com.cozybench.plant.dto.PlantResponse;
import com.cozybench.plant.service.PlantService;
import com.cozybench.guest.GuestSessionRecord;
import com.cozybench.guest.GuestSessionRegistry;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Validated
@RestController
@RequestMapping("/api/v1/plants")
public class PlantController {

    private final PlantService plantService;
    private final com.cozybench.plant.service.DefaultPlantLibrary defaultPlants;
    private final GuestSessionRegistry guestSessions;

    public PlantController(
            PlantService plantService,
            com.cozybench.plant.service.DefaultPlantLibrary defaultPlants,
            GuestSessionRegistry guestSessions
    ) {
        this.plantService = plantService;
        this.defaultPlants = defaultPlants;
        this.guestSessions = guestSessions;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> create(
            HttpServletRequest request,
            @RequestParam @NotBlank String plantName,
            @RequestParam @PositiveOrZero double reflectance,
            @RequestParam @PositiveOrZero double transmittance,
            @RequestParam @Positive double vcmax,
            @RequestParam @Positive double jmax,
            @RequestParam @PositiveOrZero double rd,
            @RequestParam MultipartFile objFile
    ) {
        String id = plantService.create(
                ownerId(request),
                plantName,
                reflectance,
                transmittance,
                vcmax,
                jmax,
                rd,
                objFile
        );
        return ResponseEntity.status(201).body(Map.of("plantId", id));
    }

    @GetMapping("/defaults")
    public Map<String, Object> defaults() {
        return defaultPlants.choices();
    }

    @GetMapping
    public PlantListResponse list(HttpServletRequest request) {
        return plantService.list(ownerId(request));
    }

    @GetMapping("/{plantId}")
    public PlantResponse get(
            HttpServletRequest request,
            @PathVariable String plantId
    ) {
        return plantService.get(ownerId(request), plantId);
    }

    @GetMapping(value = "/{plantId}/obj", produces = MediaType.TEXT_PLAIN_VALUE)
    public byte[] obj(
            HttpServletRequest request,
            @PathVariable String plantId
    ) {
        return plantService.modelFile(ownerId(request), plantId, "obj");
    }

    @GetMapping(value = "/{plantId}/export", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<byte[]> exportPlant(HttpServletRequest request, @PathVariable String plantId) {
        byte[] json = plantService.exportJson(ownerId(request), plantId);
        String filename = "plant-" + plantId + ".json";
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                        org.springframework.http.ContentDisposition.attachment().filename(filename).build().toString())
                .body(json);
    }

    @GetMapping(value = "/{plantId}/mtl", produces = MediaType.TEXT_PLAIN_VALUE)
    public byte[] mtl(
            HttpServletRequest request,
            @PathVariable String plantId
    ) {
        return plantService.modelFile(ownerId(request), plantId, "mtl");
    }

    @DeleteMapping("/{plantId}")
    public ResponseEntity<Void> delete(
            HttpServletRequest request,
            @PathVariable String plantId
    ) {
        plantService.delete(ownerId(request), plantId);
        return ResponseEntity.noContent().build();
    }

    private String ownerId(HttpServletRequest request) {
        Object value = request.getAttribute(GuestSessionRegistry.REQUEST_ATTRIBUTE);
        if (value instanceof GuestSessionRecord record) return record.guestSessionId();
        return guestSessions.getOrCreate(request.getSession(true)).guestSessionId();
    }
}
