package com.cozybench.simulation.service;

import com.cozybench.simulation.dto.OpenWindowsRequest;
import com.cozybench.simulation.dto.Co2ControlRequest;
import com.cozybench.simulation.dto.PlantSimulationRequest;
import com.cozybench.simulation.dto.StartSimulationRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class CosimulatorSimulationClient {

    private static final ParameterizedTypeReference<Map<String, Object>> MAP_TYPE =
            new ParameterizedTypeReference<>() { };

    private final String baseUrl;
    private final RestTemplate cosimulator;
    private final RestTemplate analyticsHttp;
    private final com.cozybench.plant.service.DefaultPlantLibrary defaultPlants;

    public CosimulatorSimulationClient(
            @Value("${cozybench.cosimulator.base-url:http://localhost:5000}") String baseUrl,
            com.cozybench.plant.service.DefaultPlantLibrary defaultPlants
    ) {
        this.baseUrl = baseUrl;
        this.cosimulator = new RestTemplate();
        var analyticsRequests = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        analyticsRequests.setConnectTimeout(java.time.Duration.ofSeconds(5));
        analyticsRequests.setReadTimeout(java.time.Duration.ofMinutes(2));
        this.analyticsHttp = new RestTemplate(analyticsRequests);
        this.defaultPlants = defaultPlants;
    }

    public String start(String userEmail, String constructionSetName, StartSimulationRequest request,
                        com.cozybench.simulation.dto.ConstructionSetSnapshot snapshot) {
        String preparedPlantId = request.plantSimulation() == null ? null
                : defaultPlants.prepare(userEmail, request.plantSimulation().plantId());
        Map<String, Object> context = new LinkedHashMap<>();
        context.put("city", request.city().trim());
        context.put("construction_set", constructionSetName);
        if (request.plantSimulation() != null) {
            Map<String, Object> plant = plantMap(request.plantSimulation());
            if (preparedPlantId != null) plant.put("plant_id", preparedPlantId);
            context.put("plant_simulation", plant);
        }
        if (request.openWindows() != null) {
            context.put("open_windows", windowMap(request.openWindows()));
        }
        if (request.co2Control() != null) {
            context.put("co2_control", co2ControlMap(request.co2Control()));
        }

        Map<String, Object> requestBody = Map.of(
                "user_email", userEmail,
                "simulation_context", context,
                "construction_set_snapshot", snapshot
        );
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(requestBody, headers);

        Map<String, Object> response;
        try {
            ResponseEntity<Map<String, Object>> exchange = cosimulator.exchange(
                    baseUrl + "/simulations/start-simulation",
                    HttpMethod.POST,
                    httpEntity,
                    MAP_TYPE
            );
            response = exchange.getBody();
        } catch (RestClientResponseException error) {
            defaultPlants.release(userEmail, preparedPlantId);
            throw new IllegalArgumentException(
                    "The co-simulator rejected the simulation request: "
                            + error.getResponseBodyAsString(),
                    error
            );
        }
        catch (RuntimeException error) {
            defaultPlants.release(userEmail, preparedPlantId);
            throw error;
        }
        String id = response == null ? null : String.valueOf(response.get("simulation_id"));
        if (id == null || id.isBlank() || "null".equals(id)) {
            defaultPlants.release(userEmail, preparedPlantId);
            throw new IllegalStateException("The co-simulator did not return a simulation id");
        }
        return id;
    }

    public void cancel(String simulationId) {
        cosimulator.exchange(
                baseUrl + "/simulations/{simulationId}/cancel",
                HttpMethod.POST,
                HttpEntity.EMPTY,
                Void.class,
                simulationId
        );
    }

    /** Removes the simulation's local EnergyPlus files from the co-simulator workspace. */
    public void deleteWorkspace(String simulationId, String userEmail) {
        var uri = org.springframework.web.util.UriComponentsBuilder
                .fromUriString(baseUrl + "/simulations/{simulationId}")
                .queryParam("user_email", userEmail)
                .buildAndExpand(simulationId)
                .encode()
                .toUri();
        cosimulator.exchange(uri, HttpMethod.DELETE, HttpEntity.EMPTY, Void.class);
    }

    public Map<String, Object> comparison(Map<String, Object> body) {
        var response = analyticsHttp.exchange(baseUrl + "/simulations/analytics/comparison",
                HttpMethod.POST, new HttpEntity<>(body), MAP_TYPE).getBody();
        if (response == null) throw new IllegalStateException("Python returned no comparison analytics");
        return response;
    }

    public Map<String, Object> analytics(String email, String id, int start, Integer end) {
        var uri = org.springframework.web.util.UriComponentsBuilder
                .fromUriString(baseUrl + "/simulations/{id}/analytics")
                .queryParam("user_email", email).queryParam("startIndex", start);
        if (end != null) uri.queryParam("endIndex", end);
        var response = analyticsHttp.exchange(uri.buildAndExpand(id).encode().toUri(),
                HttpMethod.GET, HttpEntity.EMPTY, MAP_TYPE).getBody();
        if (response == null) throw new IllegalStateException("Python returned no analytics");
        return response;
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> timesteps(String email, String id, int offset, Integer limit) {
        var uri = org.springframework.web.util.UriComponentsBuilder
                .fromUriString(baseUrl + "/simulations/{id}/results")
                .queryParam("user_email", email).queryParam("offset", offset);
        if (limit != null) uri.queryParam("limit", limit);
        var response = analyticsHttp.exchange(uri.buildAndExpand(id).encode().toUri(),
                HttpMethod.GET, HttpEntity.EMPTY, MAP_TYPE).getBody();
        if (response == null) throw new IllegalStateException("Python returned no timestep results");
        return (List<Map<String, Object>>) response.get("timesteps");
    }

    public Map<String, Object> latest(String email, String id) {
        var uri = org.springframework.web.util.UriComponentsBuilder
                .fromUriString(baseUrl + "/simulations/{id}/results/latest")
                .queryParam("user_email", email).buildAndExpand(id).encode().toUri();
        return analyticsHttp.exchange(uri, HttpMethod.GET, HttpEntity.EMPTY, MAP_TYPE).getBody();
    }

    public Map<String, Object> availableAnalytics() {
        return analyticsHttp.exchange(baseUrl + "/simulations/analytics/available",
                HttpMethod.GET, HttpEntity.EMPTY, MAP_TYPE).getBody();
    }

    public Map<String, Object> selectedAnalytics(String email, String id, Map<String, Object> options) {
        var uri = org.springframework.web.util.UriComponentsBuilder
                .fromUriString(baseUrl + "/simulations/{id}/analytics")
                .queryParam("user_email", email).buildAndExpand(id).encode().toUri();
        return analyticsHttp.exchange(uri, HttpMethod.POST, new HttpEntity<>(options), MAP_TYPE).getBody();
    }

    private Map<String, Object> plantMap(PlantSimulationRequest plant) {
        Map<String, Object> values = new LinkedHashMap<>();
        if (plant.plantId() != null && !plant.plantId().isBlank()) {
            values.put("plant_id", plant.plantId());
        }
        values.put("plant_name", plant.plantName().trim());
        values.put("green_wall_size", plant.greenWallSize().name().toLowerCase(Locale.ROOT));
        values.put("lighting_level", plant.lightingLevel().name().toLowerCase(Locale.ROOT));
        values.put("exchange_mode", plant.exchangeMode().name().toLowerCase(Locale.ROOT));
        return values;
    }

    private Map<String, Object> windowMap(OpenWindowsRequest windows) {
        return Map.of(
                "opening_strategy", windows.openingStrategy().name().toLowerCase(Locale.ROOT),
                "temperature_margin_c", windows.temperatureMarginC(),
                "co2_threshold_ppm", windows.co2ThresholdPpm()
        );
    }

    private Map<String, Object> co2ControlMap(Co2ControlRequest control) {
        return Map.of("setpoint_ppm", control.setpointPpm());
    }
}
