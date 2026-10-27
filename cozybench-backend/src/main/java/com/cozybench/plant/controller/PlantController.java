package com.cozybench.plant.controller;

import com.cozybench.plant.dto.PlantListResponse;
import com.cozybench.plant.dto.PlantResponse;
import com.cozybench.plant.service.PlantService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
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

    public PlantController(PlantService plantService, com.cozybench.plant.service.DefaultPlantLibrary defaultPlants) {
        this.plantService = plantService;
        this.defaultPlants = defaultPlants;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> create(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam @NotBlank String plantName,
            @RequestParam @PositiveOrZero double reflectance,
            @RequestParam @PositiveOrZero double transmittance,
            @RequestParam @Positive double vcmax,
            @RequestParam @Positive double jmax,
            @RequestParam @PositiveOrZero double rd,
            @RequestParam MultipartFile objFile
    ) {
        String id = plantService.create(
                jwt.getClaimAsString("email"),
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
    public PlantListResponse list(@AuthenticationPrincipal Jwt jwt) {
        return plantService.list(jwt.getClaimAsString("email"));
    }

    @GetMapping("/{plantId}")
    public PlantResponse get(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String plantId
    ) {
        return plantService.get(jwt.getClaimAsString("email"), plantId);
    }

    @GetMapping(value = "/{plantId}/obj", produces = MediaType.TEXT_PLAIN_VALUE)
    public byte[] obj(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String plantId
    ) {
        return plantService.modelFile(jwt.getClaimAsString("email"), plantId, "obj");
    }

    @GetMapping(value = "/{plantId}/export", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<byte[]> exportPlant(@AuthenticationPrincipal Jwt jwt, @PathVariable String plantId) {
        byte[] json = plantService.exportJson(jwt.getClaimAsString("email"), plantId);
        String filename = "plant-" + plantId + ".json";
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                        org.springframework.http.ContentDisposition.attachment().filename(filename).build().toString())
                .body(json);
    }

    @GetMapping(value = "/{plantId}/mtl", produces = MediaType.TEXT_PLAIN_VALUE)
    public byte[] mtl(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String plantId
    ) {
        return plantService.modelFile(jwt.getClaimAsString("email"), plantId, "mtl");
    }

    @DeleteMapping("/{plantId}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String plantId
    ) {
        plantService.delete(jwt.getClaimAsString("email"), plantId);
        return ResponseEntity.noContent().build();
    }
}
