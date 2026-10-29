package com.cozybench.simulation.service;

import com.cozybench.building.model.type.ComponentCategory;
import com.cozybench.building.model.type.ComponentTypeRegistry;
import com.cozybench.simulation.dto.ComponentSnapshot;
import com.cozybench.simulation.dto.ConstructionSetSnapshot;
import com.cozybench.simulation.dto.CurrentSimulationResponse;
import com.cozybench.simulation.dto.DashboardSummaryResponse;
import com.cozybench.simulation.dto.OpenWindowsRequest;
import com.cozybench.simulation.dto.Co2ControlRequest;
import com.cozybench.simulation.dto.ThermostatSetpointsRequest;
import com.cozybench.simulation.dto.PlantSimulationRequest;
import com.cozybench.simulation.dto.SimulationListResponse;
import com.cozybench.simulation.dto.SimulationResultsResponse;
import com.cozybench.simulation.dto.SimulationSummaryResponse;
import com.cozybench.simulation.dto.StartSimulationRequest;
import com.cozybench.simulation.model.GreenWallSize;
import com.cozybench.simulation.model.PlantLightingLevel;
import com.cozybench.simulation.model.PlantCo2ExchangeMode;
import com.cozybench.simulation.model.ScenarioType;
import com.cozybench.simulation.model.WindowOpeningStrategy;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class SimulationService {

    private static final String SIMULATIONS = "simulations";
    private static final String TIMESTEPS = "simulation_timesteps";
    private static final List<String> ACTIVE_STATUSES =
            List.of("PENDING", "STARTING", "RUNNING");
    private static final long RESULT_COUNT_CACHE_MILLIS = 30_000;

    // Completed results are paged repeatedly; keep their count briefly, not their timesteps.
    private record ResultKey(String userEmail, String simulationId) {}
    private record CachedCount(long count, long expiresAt) {}
    private final Map<ResultKey, CachedCount> resultCounts = Collections.synchronizedMap(
            new LinkedHashMap<>(128, 0.75f, true) {
                @Override
                protected boolean removeEldestEntry(Map.Entry<ResultKey, CachedCount> entry) {
                    return size() > 128;
                }
            }
    );

    private final MongoTemplate mongoTemplate;
    private final ConstructionSetSnapshotService snapshotService;
    private final CosimulatorSimulationClient cosimulator;
    private final ComponentTypeRegistry componentTypes;

    public SimulationService(
            MongoTemplate mongoTemplate,
            ConstructionSetSnapshotService snapshotService,
            CosimulatorSimulationClient cosimulator,
            ComponentTypeRegistry componentTypes
    ) {
        this.mongoTemplate = mongoTemplate;
        this.snapshotService = snapshotService;
        this.cosimulator = cosimulator;
        this.componentTypes = componentTypes;
    }

    public SimulationSummaryResponse start(
            String ownerId,
            String userEmail,
            StartSimulationRequest request
    ) {
        ConstructionSetSnapshot snapshot = snapshotService.snapshot(
                ownerId,
                request.constructionSet()
        );
        String constructionSetName = snapshot.constructionSet().name();
        Instant requestedAt = Instant.now();

        String simulationId;
        if (request.scenarioType() == ScenarioType.REFERENCE) {
            simulationId = cosimulator.start(userEmail, constructionSetName, request, snapshot);
            Query query = idQuery(simulationId);
            Update update = metadataUpdate(
                    ownerId,
                    request,
                    snapshot,
                    requestedAt
            );
            mongoTemplate.updateFirst(query, update, SIMULATIONS);
        }
        else {
            ObjectId id = new ObjectId();
            Document document = new Document()
                    .append("_id", id)
                    .append("owner_id", ownerId)
                    .append("user_email", userEmail)
                    .append("display_name", request.name().trim())
                    .append("scenario_type", ScenarioType.CUSTOM.name())
                    .append("status", "CUSTOM_READY")
                    .append("progress", 0)
                    .append("start_time", null)
                    .append("end_time", null)
                    .append("requested_at", Date.from(requestedAt))
                    .append("parameters", parameterMap(request, constructionSetName))
                    .append("construction_set_snapshot", snapshotMap(snapshot))
                    .append("custom_scenario", new Document(request.customScenario()))
                    .append("error", null);
            mongoTemplate.insert(document, SIMULATIONS);
            simulationId = id.toHexString();
        }

        return get(ownerId, userEmail, simulationId);
    }

    public SimulationListResponse all(String ownerId, String userEmail) {
        Query query = new Query(ownerCriteria(ownerId, userEmail))
                .with(Sort.by(Sort.Order.desc("requested_at"), Sort.Order.desc("start_time")));
        List<SimulationSummaryResponse> simulations = mongoTemplate
                .find(query, Document.class, SIMULATIONS)
                .stream()
                .map(document -> toSummary(document, userEmail))
                .toList();
        return new SimulationListResponse(simulations.size(), simulations);
    }

    public SimulationListResponse history(String ownerId, String userEmail) {
        Criteria criteria = new Criteria().andOperator(
                ownerCriteria(ownerId, userEmail),
                Criteria.where("status").nin(ACTIVE_STATUSES)
        );
        Query query = new Query(criteria)
                .with(Sort.by(Sort.Order.desc("end_time"), Sort.Order.desc("requested_at")));
        List<SimulationSummaryResponse> simulations = mongoTemplate
                .find(query, Document.class, SIMULATIONS)
                .stream()
                .map(document -> toSummary(document, userEmail))
                .toList();
        return new SimulationListResponse(simulations.size(), simulations);
    }

    public boolean isNameAvailable(String ownerId, String userEmail, String name) {
        String trimmed = name.trim();
        if (trimmed.isEmpty()) throw new IllegalArgumentException("Simulation name is required");
        Criteria criteria = new Criteria().andOperator(
                ownerCriteria(ownerId, userEmail),
                Criteria.where("display_name").regex("^" + Pattern.quote(trimmed) + "$", "i")
        );
        return !mongoTemplate.exists(new Query(criteria), SIMULATIONS);
    }

    public SimulationSummaryResponse get(String ownerId, String userEmail, String simulationId) {
        return toSummary(requireOwned(ownerId, userEmail, simulationId), userEmail);
    }

    public Optional<CurrentSimulationResponse> current(String ownerId, String userEmail) {
        Criteria criteria = new Criteria().andOperator(
                ownerCriteria(ownerId, userEmail),
                Criteria.where("status").in(ACTIVE_STATUSES)
        );
        Query query = new Query(criteria)
                .with(Sort.by(Sort.Order.desc("requested_at"), Sort.Order.desc("start_time")))
                .limit(1);
        Document document = mongoTemplate.findOne(query, Document.class, SIMULATIONS);
        if (document == null) {
            return Optional.empty();
        }
        String simulationId = objectId(document.get("_id"));
        return Optional.of(new CurrentSimulationResponse(
                toSummary(document, userEmail),
                latestTimestep(userEmail, simulationId).orElse(Map.of())
        ));
    }

    public SimulationSummaryResponse cancel(
            String ownerId,
            String userEmail,
            String simulationId
    ) {
        Document document = requireOwned(ownerId, userEmail, simulationId);
        ScenarioType scenario = scenario(document);
        if (scenario == ScenarioType.REFERENCE
                && ACTIVE_STATUSES.contains(string(document.get("status")))) {
            cosimulator.cancel(simulationId);
        }
        else {
            mongoTemplate.updateFirst(
                    idQuery(simulationId),
                    new Update()
                            .set("status", "CANCELED")
                            .set("end_time", Date.from(Instant.now())),
                    SIMULATIONS
            );
        }
        return get(ownerId, userEmail, simulationId);
    }

    public void delete(String ownerId, String userEmail, String simulationId) {
        Document simulation = requireOwned(ownerId, userEmail, simulationId);
        if (ACTIVE_STATUSES.contains(string(simulation.get("status")))) {
            throw new IllegalArgumentException(
                    "An active simulation must be canceled before it can be deleted"
            );
        }

        // The Python co-simulator owns the local EnergyPlus files; remove them before Mongo records.
        if (scenario(simulation) == ScenarioType.REFERENCE) {
            cosimulator.deleteWorkspace(simulationId, userEmail);
        }

        Query timesteps = new Query(
                Criteria.where("user_email").is(userEmail)
                        .and("simulation_id").is(simulationId)
        );
        mongoTemplate.remove(timesteps, TIMESTEPS);
        resultCounts.remove(new ResultKey(userEmail, simulationId));
        mongoTemplate.remove(
                new Query(new Criteria().andOperator(
                        idCriteria(simulationId),
                        ownerCriteria(ownerId, userEmail)
                )),
                SIMULATIONS
        );
    }

    public org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody exportJson(
            String ownerId, String userEmail, String simulationId
    ) {
        Document simulation = requireOwned(ownerId, userEmail, simulationId);
        if (ACTIVE_STATUSES.contains(string(simulation.get("status")))) {
            throw new IllegalArgumentException("Wait for the simulation to finish before exporting");
        }
        String metadata = new Document(normalizeDocument(simulation)).toJson();
        Query query = new Query(Criteria.where("user_email").is(userEmail)
                .and("simulation_id").is(simulationId))
                .with(Sort.by(Sort.Order.asc("timestep_number"), Sort.Order.asc("_id")));
        return output -> {
            var writer = new java.io.BufferedWriter(new java.io.OutputStreamWriter(
                    output, java.nio.charset.StandardCharsets.UTF_8));
            writer.write("{\n  \"simulation\": ");
            writer.write(metadata);
            writer.write(",\n  \"timesteps\": [");
            // Stream every record from MongoDB instead of loading an annual run into memory.
            try (var timesteps = mongoTemplate.stream(query, Document.class, TIMESTEPS)) {
                var iterator = timesteps.iterator();
                boolean first = true;
                while (iterator.hasNext()) {
                    if (!first) writer.write(",");
                    writer.write("\n    ");
                    writer.write(new Document(normalizeDocument(iterator.next())).toJson());
                    first = false;
                }
            }
            writer.write("\n  ]\n}\n");
            writer.flush();
        };
    }

    public SimulationResultsResponse results(
            String ownerId,
            String userEmail,
            String simulationId,
            int offset,
            Integer limit
    ) {
        Document simulation = requireOwned(ownerId, userEmail, simulationId);
        Criteria criteria = Criteria.where("user_email").is(userEmail)
                .and("simulation_id").is(simulationId);
        ResultKey key = new ResultKey(userEmail, simulationId);
        boolean completed = "COMPLETED".equals(string(simulation.get("status")));
        if (!completed) resultCounts.remove(key);
        long now = System.currentTimeMillis();
        CachedCount cached = completed ? resultCounts.get(key) : null;
        long total;
        if (cached != null && cached.expiresAt() > now) {
            total = cached.count();
        } else {
            total = mongoTemplate.count(new Query(criteria), TIMESTEPS);
            if (completed) {
                resultCounts.put(key, new CachedCount(total, now + RESULT_COUNT_CACHE_MILLIS));
            }
        }
        Query page = new Query(criteria)
                .with(Sort.by(Sort.Direction.ASC, "timestep_number"))
                .skip(Math.max(0, offset));
        if (limit != null) {
            page.limit(limit);
        }
        List<Map<String, Object>> timesteps = mongoTemplate
                .find(page, Document.class, TIMESTEPS)
                .stream()
                .map(this::presentTimestep)
                .toList();
        return new SimulationResultsResponse(
                simulationId,
                Math.max(0, offset),
                limit,
                total,
                timesteps.size(),
                timesteps
        );
    }

    public Map<String, Object> analytics(String ownerId, String email, String id, int start, Integer end) {
        requireOwned(ownerId, email, id);
        return cosimulator.analytics(email, id, start, end);
    }

    public Map<String, Object> availableAnalytics() {
        return cosimulator.availableAnalytics();
    }

    public Map<String, Object> selectedAnalytics(String ownerId, String email, String id, Map<String, Object> options) {
        requireOwned(ownerId, email, id);
        return cosimulator.selectedAnalytics(email, id, options);
    }

    public DashboardSummaryResponse dashboard(String ownerId, String userEmail) {
        Query simulations = new Query(ownerCriteria(ownerId, userEmail));
        long total = mongoTemplate.count(simulations, SIMULATIONS);
        long constructionSets = countWorkspaceComponents(
                ownerId,
                ComponentCategory.CONSTRUCTION_SET
        );
        long constructions = countWorkspaceComponents(
                ownerId,
                ComponentCategory.CONSTRUCTION
        );
        long materials = countWorkspaceComponents(
                ownerId,
                ComponentCategory.MATERIAL
        );
        long plantModels = mongoTemplate.count(
                new Query(new Criteria().andOperator(
                        Criteria.where("user_email").is(userEmail),
                        Criteria.where("status").is("COMPLETED")
                )),
                "plants"
        );
        long openWindowConfigurations = mongoTemplate.count(
                new Query(new Criteria().andOperator(
                        ownerCriteria(ownerId, userEmail),
                        Criteria.where("parameters.open_windows.opening_strategy").exists(true)
                )),
                SIMULATIONS
        );
        long plantSimulations = mongoTemplate.count(
                new Query(new Criteria().andOperator(
                        ownerCriteria(ownerId, userEmail),
                        Criteria.where("parameters.plant_simulation.plant_id").exists(true)
                )),
                SIMULATIONS
        );
        long co2ControlSimulations = mongoTemplate.count(
                new Query(new Criteria().andOperator(
                        ownerCriteria(ownerId, userEmail),
                        Criteria.where("parameters.co2_control.setpoint_ppm").exists(true)
                )),
                SIMULATIONS
        );

        return new DashboardSummaryResponse(
                total,
                openWindowConfigurations,
                plantSimulations,
                co2ControlSimulations,
                constructionSets,
                constructions,
                plantModels,
                materials
        );
    }

    private long countWorkspaceComponents(
            String ownerId,
            ComponentCategory category
    ) {
        return mongoTemplate.count(
                new Query(new Criteria().andOperator(
                        Criteria.where("ownerId").is(ownerId),
                        Criteria.where("type").in(componentTypes.eppyNames(category))
                )),
                "workspaceComponent"
        );
    }

    private Update metadataUpdate(
            String ownerId,
            StartSimulationRequest request,
            ConstructionSetSnapshot snapshot,
            Instant requestedAt
    ) {
        Update update = new Update()
                .set("owner_id", ownerId)
                .set("display_name", request.name().trim())
                .set("scenario_type", request.scenarioType().name())
                .set("requested_at", Date.from(requestedAt))
                .set("construction_set_snapshot", snapshotMap(snapshot));
        // The engine may use a temporary copy, but previews need the selected plant's stable ID.
        if (request.plantSimulation() != null && request.plantSimulation().plantId() != null) {
            update.set("plant_preview_id", request.plantSimulation().plantId());
        }
        if (!request.customScenario().isEmpty()) {
            update.set("custom_scenario", new Document(request.customScenario()));
        }
        return update;
    }

    private Document requireOwned(String ownerId, String userEmail, String simulationId) {
        Criteria criteria = new Criteria().andOperator(
                idCriteria(simulationId),
                ownerCriteria(ownerId, userEmail)
        );
        Document document = mongoTemplate.findOne(
                new Query(criteria),
                Document.class,
                SIMULATIONS
        );
        if (document == null) {
            throw new IllegalArgumentException("Simulation was not found");
        }
        return document;
    }

    private SimulationSummaryResponse toSummary(Document document, String userEmail) {
        String id = objectId(document.get("_id"));
        Map<String, Object> parameters = map(document.get("parameters"));
        ResultMeta resultMeta = resultMeta(userEmail, id);
        return new SimulationSummaryResponse(
                id,
                nonBlank(string(document.get("display_name")), "Simulation " + shortId(id)),
                scenario(document),
                nonBlank(string(document.get("status")), "UNKNOWN"),
                integer(document.get("progress")),
                string(parameters.get("city")),
                string(parameters.get("construction_set")),
                plantWithPreviewId(parameters.get("plant_simulation"), string(document.get("plant_preview_id"))),
                windows(parameters.get("open_windows")),
                co2Control(parameters.get("co2_control")),
                thermostat(parameters.get("thermostat_setpoints")),
                instant(document.get("requested_at")),
                instant(document.get("start_time")),
                instant(document.get("end_time")),
                resultMeta.firstTimestamp(),
                resultMeta.lastTimestamp(),
                resultMeta.count(),
                string(document.get("error")),
                snapshot(document.get("construction_set_snapshot")),
                map(document.get("custom_scenario"))
        );
    }

    private ResultMeta resultMeta(String userEmail, String simulationId) {
        Criteria criteria = Criteria.where("user_email").is(userEmail)
                .and("simulation_id").is(simulationId);
        long count = mongoTemplate.count(new Query(criteria), TIMESTEPS);
        if (count == 0) {
            return new ResultMeta(0, null, null);
        }
        Query firstQuery = new Query(criteria)
                .with(Sort.by(Sort.Order.asc("timestep_number")))
                .limit(1);
        Query lastQuery = new Query(criteria)
                .with(Sort.by(Sort.Order.desc("timestep_number")))
                .limit(1);
        Document first = mongoTemplate.findOne(firstQuery, Document.class, TIMESTEPS);
        Document last = mongoTemplate.findOne(lastQuery, Document.class, TIMESTEPS);
        return new ResultMeta(
                count,
                timestamp(first),
                timestamp(last)
        );
    }

    private Optional<Map<String, Object>> latestTimestep(String userEmail, String simulationId) {
        Query query = new Query(Criteria.where("user_email").is(userEmail)
                .and("simulation_id").is(simulationId))
                .with(Sort.by(Sort.Direction.DESC, "timestep_number"))
                .limit(1);
        Document latest = mongoTemplate.findOne(query, Document.class, TIMESTEPS);
        return latest == null ? Optional.empty() : Optional.of(presentTimestep(latest));
    }

    private Criteria ownerCriteria(String ownerId, String userEmail) {
        return new Criteria().orOperator(
                Criteria.where("owner_id").is(ownerId),
                Criteria.where("user_email").is(userEmail)
        );
    }

    private Query idQuery(String simulationId) {
        return new Query(idCriteria(simulationId));
    }

    private Criteria idCriteria(String simulationId) {
        Object id = ObjectId.isValid(simulationId) ? new ObjectId(simulationId) : simulationId;
        return Criteria.where("_id").is(id);
    }

    private Map<String, Object> parameterMap(
            StartSimulationRequest request,
            String constructionSetName
    ) {
        Map<String, Object> parameters = new LinkedHashMap<>();
        parameters.put("city", request.city().trim());
        parameters.put("construction_set", constructionSetName);
        if (request.plantSimulation() != null) {
            parameters.put("plant_simulation", plantMap(request.plantSimulation()));
        }
        if (request.openWindows() != null) {
            parameters.put("open_windows", windowsMap(request.openWindows()));
        }
        if (request.co2Control() != null) {
            parameters.put("co2_control", co2ControlMap(request.co2Control()));
        }
        if (request.thermostatSetpoints() != null) {
            parameters.put("thermostat_setpoints", thermostatMap(request.thermostatSetpoints()));
        }
        return parameters;
    }

    private Map<String, Object> plantMap(PlantSimulationRequest plant) {
        Map<String, Object> values = new LinkedHashMap<>();
        values.put("plant_id", plant.plantId());
        values.put("plant_name", plant.plantName());
        values.put("green_wall_size", plant.greenWallSize().name().toLowerCase(Locale.ROOT));
        values.put("lighting_level", plant.lightingLevel().name().toLowerCase(Locale.ROOT));
        values.put("exchange_mode", plant.exchangeMode().name().toLowerCase(Locale.ROOT));
        return values;
    }

    private Map<String, Object> windowsMap(OpenWindowsRequest windows) {
        Map<String, Object> values = new LinkedHashMap<>();
        values.put("opening_strategy", windows.openingStrategy().name().toLowerCase(Locale.ROOT));
        values.put("temperature_margin_c", windows.temperatureMarginC());
        values.put("co2_threshold_ppm", windows.co2ThresholdPpm());
        if (windows.openingStrategy() == WindowOpeningStrategy.FIXED_PERCENTAGE) {
            values.put("opening_percentage", windows.openingPercentage());
        }
        return values;
    }

    private Map<String, Object> thermostatMap(ThermostatSetpointsRequest settings) {
        return Map.of(
                "heating_setpoint_c", settings.heatingSetpointC(),
                "cooling_setpoint_c", settings.coolingSetpointC()
        );
    }

    private Map<String, Object> co2ControlMap(Co2ControlRequest control) {
        return Map.of("setpoint_ppm", control.setpointPpm());
    }

    private Map<String, Object> snapshotMap(ConstructionSetSnapshot snapshot) {
        Map<String, Object> values = new LinkedHashMap<>();
        values.put("constructionSet", componentMap(snapshot.constructionSet()));
        values.put("constructions", snapshot.constructions().stream().map(this::componentMap).toList());
        values.put("materials", snapshot.materials().stream().map(this::componentMap).toList());
        return values;
    }

    private Map<String, Object> componentMap(ComponentSnapshot component) {
        return Map.of(
                "id", component.id(),
                "name", component.name(),
                "type", component.type(),
                "properties", component.properties()
        );
    }

    private ConstructionSetSnapshot snapshot(Object value) {
        Map<String, Object> values = map(value);
        if (values.isEmpty()) {
            return null;
        }
        ComponentSnapshot constructionSet = component(values.get("constructionSet"));
        List<ComponentSnapshot> constructions = componentList(values.get("constructions"));
        List<ComponentSnapshot> materials = componentList(values.get("materials"));
        return new ConstructionSetSnapshot(constructionSet, constructions, materials);
    }

    private List<ComponentSnapshot> componentList(Object value) {
        if (!(value instanceof List<?> list)) {
            return List.of();
        }
        return list.stream().map(this::component).toList();
    }

    private ComponentSnapshot component(Object value) {
        Map<String, Object> component = map(value);
        Map<String, String> properties = new LinkedHashMap<>();
        map(component.get("properties")).forEach((key, propertyValue) ->
                properties.put(key, propertyValue == null ? null : String.valueOf(propertyValue))
        );
        return new ComponentSnapshot(
                string(component.get("id")),
                string(component.get("name")),
                string(component.get("type")),
                properties
        );
    }

    private PlantSimulationRequest plant(Object value) {
        Map<String, Object> plant = map(value);
        if (plant.isEmpty()) {
            return null;
        }
        return new PlantSimulationRequest(
                string(plant.get("plant_id")),
                string(plant.get("plant_name")),
                enumValueOrNull(GreenWallSize.class, plant.get("green_wall_size")),
                enumValue(
                        PlantLightingLevel.class,
                        plant.get("lighting_level"),
                        PlantLightingLevel.MEDIUM
                ),
                enumValue(
                        PlantCo2ExchangeMode.class,
                        plant.get("exchange_mode"),
                        PlantCo2ExchangeMode.FULL_EXCHANGE
                )
        );
    }

    private PlantSimulationRequest plantWithPreviewId(Object value, String previewId) {
        PlantSimulationRequest settings = plant(value);
        if (settings == null || previewId == null || previewId.isBlank()) return settings;
        return new PlantSimulationRequest(previewId, settings.plantName(), settings.greenWallSize(),
                settings.lightingLevel(), settings.exchangeMode());
    }

    private OpenWindowsRequest windows(Object value) {
        Map<String, Object> windows = map(value);
        if (windows.isEmpty()) {
            return null;
        }
        return new OpenWindowsRequest(
                enumValue(
                        WindowOpeningStrategy.class,
                        windows.get("opening_strategy"),
                        WindowOpeningStrategy.LINEAR
                ),
                decimal(windows.get("temperature_margin_c")),
                decimal(windows.get("co2_threshold_ppm")),
                windows.get("opening_percentage") instanceof Number percentage ? percentage.doubleValue() : null
        );
    }

    private ThermostatSetpointsRequest thermostat(Object value) {
        Map<String, Object> settings = map(value);
        if (settings.isEmpty()) return null;
        return new ThermostatSetpointsRequest(
                decimal(settings.get("heating_setpoint_c")),
                decimal(settings.get("cooling_setpoint_c"))
        );
    }

    private Co2ControlRequest co2Control(Object value) {
        Map<String, Object> control = map(value);
        if (control.isEmpty()) {
            return null;
        }
        return new Co2ControlRequest(integer(control.get("setpoint_ppm")));
    }

    private ScenarioType scenario(Document document) {
        return enumValue(
                ScenarioType.class,
                document.get("scenario_type"),
                ScenarioType.REFERENCE
        );
    }

    private long countStatus(List<Document> documents, String status) {
        return documents.stream()
                .filter(document -> status.equalsIgnoreCase(string(document.get("status"))))
                .count();
    }

    private String timestamp(Document document) {
        return document == null ? null : timestampValue(document.get("simulation_timestamp"));
    }

    private String timestampValue(Object value) {
        if (value instanceof Date date) {
            return date.toInstant().toString();
        }
        if (value instanceof Instant instant) {
            return instant.toString();
        }
        return value == null ? null : String.valueOf(value);
    }

    private Instant instant(Object value) {
        if (value instanceof Date date) {
            return date.toInstant();
        }
        if (value instanceof Instant instant) {
            return instant;
        }
        if (value == null) {
            return null;
        }
        try {
            return OffsetDateTime.parse(String.valueOf(value)).toInstant();
        } catch (RuntimeException ignored) {
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> map(Object value) {
        if (!(value instanceof Map<?, ?> source)) {
            return Collections.emptyMap();
        }
        Map<String, Object> result = new LinkedHashMap<>();
        source.forEach((key, entry) -> result.put(String.valueOf(key), entry));
        return result;
    }

    private Map<String, Object> normalizeDocument(Document source) {
        Map<String, Object> values = new LinkedHashMap<>();
        source.forEach((key, value) -> values.put(key, normalize(value)));
        return values;
    }

    /** Preserve the derived fields previously added by the Python endpoint. */
    private Map<String, Object> presentTimestep(Document source) {
        Map<String, Object> timestep = normalizeDocument(source);
        Map<String, Object> results = new LinkedHashMap<>(map(timestep.get("results")));
        Map<String, Object> meters = new LinkedHashMap<>(map(results.get("meter_results")));
        for (String name : List.of("hvac", "heating", "cooling")) {
            Object joules = meters.get(name + "_electricity_j");
            meters.put(name + "_electricity_kwh",
                    joules instanceof Number number ? number.doubleValue() / 3_600_000 : null);
        }
        results.put("meter_results", meters);

        Map<String, Object> zones = map(results.get("zone_results"));
        for (Object value : zones.values()) {
            if (!(value instanceof Map<?, ?>)) continue;
            @SuppressWarnings("unchecked")
            Map<String, Object> zone = (Map<String, Object>) value;
            Object air = zone.get("zone_air_temp_c");
            Object radiant = zone.get("mean_radiant_temperature_c");
            zone.put("operative_temperature_c", air instanceof Number a && radiant instanceof Number r
                    ? (a.doubleValue() + r.doubleValue()) / 2 : null);
        }
        timestep.put("results", results);
        return timestep;
    }

    private Object normalize(Object value) {
        if (value instanceof ObjectId objectId) {
            return objectId.toHexString();
        }
        if (value instanceof Date date) {
            return date.toInstant().toString();
        }
        if (value instanceof Map<?, ?> map) {
            Map<String, Object> result = new LinkedHashMap<>();
            map.forEach((key, entry) -> result.put(String.valueOf(key), normalize(entry)));
            return result;
        }
        if (value instanceof List<?> list) {
            return list.stream().map(this::normalize).toList();
        }
        return value;
    }

    private String objectId(Object value) {
        return value instanceof ObjectId objectId ? objectId.toHexString() : string(value);
    }

    private String string(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private String nonBlank(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private String shortId(String id) {
        return id == null ? "unknown" : id.substring(0, Math.min(8, id.length()));
    }

    private int integer(Object value) {
        return value instanceof Number number ? number.intValue() : 0;
    }

    private double decimal(Object value) {
        return value instanceof Number number ? number.doubleValue() : 0;
    }

    private <E extends Enum<E>> E enumValue(
            Class<E> type,
            Object value,
            E fallback
    ) {
        if (value == null) {
            return fallback;
        }
        try {
            return Enum.valueOf(type, String.valueOf(value).trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ignored) {
            return fallback;
        }
    }

    private <E extends Enum<E>> E enumValueOrNull(Class<E> type, Object value) {
        return enumValue(type, value, null);
    }

    private record ResultMeta(long count, String firstTimestamp, String lastTimestamp) {
    }
}
