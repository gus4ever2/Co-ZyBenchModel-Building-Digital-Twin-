package com.cozybench.plant.service;

import com.cozybench.plant.dto.PlantListResponse;
import com.cozybench.plant.dto.PlantResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class PlantService {

    private static final ParameterizedTypeReference<Map<String, Object>> MAP_TYPE =
            new ParameterizedTypeReference<>() { };

    private final String baseUrl;
    private final RestClient cosimulator;
    private final RestTemplate plantUploadClient;
    private final DefaultPlantLibrary defaultPlants;

    public PlantService(
            @Value("${cozybench.cosimulator.base-url:http://localhost:5000}") String baseUrl,
            DefaultPlantLibrary defaultPlants
    ) {
        this.baseUrl = baseUrl;
        this.cosimulator = RestClient.builder().baseUrl(baseUrl).build();
        this.plantUploadClient = new RestTemplate();
        this.defaultPlants = defaultPlants;
    }

    public String create(
            String userEmail,
            String plantName,
            double reflectance,
            double transmittance,
            double vcmax,
            double jmax,
            double rd,
            MultipartFile objFile
    ) {
        if (objFile.isEmpty()) {
            throw new IllegalArgumentException("The OBJ file must not be empty");
        }

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("user_email", userEmail);
        body.add("plant_name", plantName.trim());
        body.add("reflectance", reflectance);
        body.add("transmittance", transmittance);
        body.add("vcmax", vcmax);
        body.add("jmax", jmax);
        body.add("rd", rd);
        try {
            body.add("obj_file", namedResource(objFile, "plant.obj"));
        } catch (IOException error) {
            throw new IllegalArgumentException("Could not read the uploaded OBJ file", error);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map<String, Object>> exchange = plantUploadClient.exchange(
                baseUrl + "/plants",
                HttpMethod.POST,
                request,
                MAP_TYPE
        );
        Map<String, Object> response = exchange.getBody();

        String plantId = string(response == null ? null : response.get("plant_id"));
        if (plantId == null || plantId.isBlank()) {
            throw new IllegalStateException("The co-simulator did not return a plant id");
        }
        return plantId;
    }

    public PlantListResponse list(String userEmail) {
        Map<String, Object> response = cosimulator.get()
                .uri(uri -> uri.path("/plants")
                        .queryParam("user_email", userEmail)
                        .build())
                .retrieve()
                .body(MAP_TYPE);

        List<?> documents = response == null
                ? List.of()
                : response.get("plants") instanceof List<?> values ? values : List.of();
        List<PlantResponse> plants = documents.stream()
                .filter(Map.class::isInstance)
                .map(Map.class::cast)
                .map(this::toResponse)
                .toList();
        return new PlantListResponse(plants.size(), plants);
    }

    public PlantResponse get(String userEmail, String plantId) {
        PlantResponse defaultPlant = defaultPlants.detail(plantId);
        if (defaultPlant != null) return defaultPlant;
        Map<String, Object> document = cosimulator.get()
                .uri(uri -> uri.path("/plants/{plantId}")
                        .queryParam("user_email", userEmail)
                        .build(plantId))
                .retrieve()
                .body(MAP_TYPE);
        if (document == null) {
            throw new IllegalStateException("The co-simulator returned an empty plant response");
        }
        return toResponse(document);
    }

    public byte[] modelFile(String userEmail, String plantId, String extension) {
        if (!extension.equals("obj") && !extension.equals("mtl")) {
            throw new IllegalArgumentException("Unsupported plant model extension: " + extension);
        }
        byte[] defaultFile = defaultPlants.modelFile(plantId, extension);
        if (defaultFile != null) return defaultFile;
        byte[] body = cosimulator.get()
                .uri(uri -> uri.path("/plants/{plantId}/{extension}")
                        .queryParam("user_email", userEmail)
                        .build(plantId, extension))
                .retrieve()
                .body(byte[].class);
        if (body == null) {
            throw new IllegalStateException("The co-simulator returned an empty plant model");
        }
        return body;
    }

    public byte[] exportJson(String userEmail, String plantId) {
        byte[] body = cosimulator.get()
                .uri(uri -> uri.path("/plants/{plantId}/export")
                        .queryParam("user_email", userEmail)
                        .build(plantId))
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .body(byte[].class);
        if (body == null) {
            throw new IllegalStateException("The co-simulator returned an empty plant export");
        }
        return body;
    }

    public void delete(String userEmail, String plantId) {
        cosimulator.delete()
                .uri(uri -> uri.path("/plants/{plantId}")
                        .queryParam("user_email", userEmail)
                        .build(plantId))
                .retrieve()
                .toBodilessEntity();
    }

    @SuppressWarnings("unchecked")
    private PlantResponse toResponse(Map<?, ?> document) {
        Map<String, Object> parameters = document.get("parameters") instanceof Map<?, ?> map
                ? (Map<String, Object>) map
                : Collections.emptyMap();
        boolean ready = document.get("obj_file_id") != null && document.get("mtl_file_id") != null;
        Map<String, Object> physiology = parameters.get("parameters") instanceof Map<?, ?> map
                ? (Map<String, Object>) map
                : parameters.get("physiology") instanceof Map<?, ?> legacy
                        ? (Map<String, Object>) legacy
                        : Collections.emptyMap();
        return new PlantResponse(
                string(document.get("_id")),
                string(parameters.get("plant_name")),
                string(parameters.get("city")),
                string(document.get("status")),
                integer(document.get("progress")),
                instant(document.get("created_at")),
                instant(document.get("start_time")),
                instant(document.get("end_time")),
                string(document.get("error")),
                integer(document.get("profile_grid_point_count")),
                decimal(physiology.get("reflectance")),
                decimal(physiology.get("transmittance")),
                decimal(physiology.get("vcmax")),
                decimal(physiology.get("jmax")),
                decimal(physiology.get("rd")),
                ready,
                decimalOrNull(document.get("total_leaf_area_m2"))
        );
    }

    private String fileName(MultipartFile file, String fallback) {
        String name = file.getOriginalFilename();
        return name == null || name.isBlank() ? fallback : name;
    }

    private ByteArrayResource namedResource(
            MultipartFile file,
            String fallbackName
    ) throws IOException {
        String fileName = fileName(file, fallbackName);
        return new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return fileName;
            }
        };
    }

    private String string(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private int integer(Object value) {
        return value instanceof Number number ? number.intValue() : 0;
    }

    private double decimal(Object value) {
        return value instanceof Number number ? number.doubleValue() : 0.0;
    }

    private Double decimalOrNull(Object value) {
        return value instanceof Number number ? number.doubleValue() : null;
    }

    private Instant instant(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Instant instant) {
            return instant;
        }
        try {
            return OffsetDateTime.parse(String.valueOf(value)).toInstant();
        } catch (RuntimeException ignored) {
            return null;
        }
    }
}
