package com.cozybench.guest;

import com.cozybench.plant.dto.PlantResponse;
import com.cozybench.plant.service.DefaultPlantLibrary;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Read-only access to the shared default plant models used by guest simulations. */
@RestController
@RequestMapping("/api/v1/guest/plants")
public class GuestPlantController {
    private final DefaultPlantLibrary defaultPlants;

    public GuestPlantController(DefaultPlantLibrary defaultPlants) {
        this.defaultPlants = defaultPlants;
    }

    @GetMapping("/{plantId}")
    public ResponseEntity<PlantResponse> get(@PathVariable String plantId) {
        PlantResponse plant = defaultPlants.detail(plantId);
        return plant == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(plant);
    }

    @GetMapping(value = "/{plantId}/obj", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<byte[]> obj(@PathVariable String plantId) {
        return modelFile(plantId, "obj");
    }

    @GetMapping(value = "/{plantId}/mtl", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<byte[]> mtl(@PathVariable String plantId) {
        return modelFile(plantId, "mtl");
    }

    private ResponseEntity<byte[]> modelFile(String plantId, String extension) {
        byte[] file = defaultPlants.modelFile(plantId, extension);
        return file == null
                ? ResponseEntity.notFound().build()
                : ResponseEntity.ok().contentType(MediaType.TEXT_PLAIN).body(file);
    }
}
