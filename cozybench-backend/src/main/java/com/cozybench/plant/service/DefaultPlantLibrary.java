package com.cozybench.plant.service;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Map;

/** Access to plant library entries; old bundled grids are not seeded at startup. */
@Service
public class DefaultPlantLibrary {
    private final MongoTemplate mongo;
    private final GridFsTemplate files;

    @org.springframework.beans.factory.annotation.Autowired
    public DefaultPlantLibrary(MongoTemplate mongo) {
        this(mongo, new GridFsTemplate(mongo.getMongoDatabaseFactory(), mongo.getConverter(), "plant_models"));
    }

    DefaultPlantLibrary(MongoTemplate mongo, GridFsTemplate files) {
        this.mongo = mongo;
        this.files = files;
    }

    public Map<String, Object> choices() {
        var plants = mongo.findAll(Document.class, "plantLibrary").stream().map(document ->
                Map.<String, Object>of("id", document.getObjectId("_id").toHexString(),
                        "name", document.getString("name"), "status", "COMPLETED", "defaultOption", true))
                .toList();
        return Map.of("plants", plants);
    }

    private Document findDefault(String id) {
        return id != null && ObjectId.isValid(id)
                ? mongo.findOne(Query.query(Criteria.where("_id").is(new ObjectId(id))), Document.class, "plantLibrary")
                : null;
    }

    public com.cozybench.plant.dto.PlantResponse detail(String id) {
        Document plant = findDefault(id);
        if (plant == null) return null;
        Document profile = plant.get("profile", Document.class);
        Document parameters = profile.get("parameters", Document.class);
        return new com.cozybench.plant.dto.PlantResponse(id, plant.getString("name"), null,
                "COMPLETED", 100, plant.getDate("created_at").toInstant(), null, null, null,
                profile.getInteger("grid_point_count"),
                number(parameters, "reflectance"), number(parameters, "transmittance"),
                number(parameters, "vcmax"), number(parameters, "jmax"), number(parameters, "rd"),
                true, number(profile, "total_leaf_area_m2"));
    }

    private double number(Document document, String key) {
        return ((Number) document.get(key)).doubleValue();
    }

    public byte[] modelFile(String id, String extension) {
        Document plant = findDefault(id);
        if (plant == null) return null;
        var file = files.findOne(Query.query(Criteria.where("_id").is(plant.get(extension + "_file_id"))));
        if (file == null) throw new IllegalStateException("Default plant model file is missing");
        try (var input = files.getResource(file).getInputStream()) {
            return input.readAllBytes();
        } catch (IOException error) {
            throw new java.io.UncheckedIOException(error);
        }
    }

    /** Each run gets its own temporary plant and grid; model files remain shared. */
    public String prepare(String userEmail, String id) {
        if (id == null || !ObjectId.isValid(id)) return id;
        Document library = mongo.findOne(Query.query(Criteria.where("_id").is(new ObjectId(id))),
                Document.class, "plantLibrary");
        if (library == null) return id;
        Document profile = Document.parse(library.get("profile", Document.class).toJson());
        ObjectId plantId = new ObjectId();
        String plantName = library.getString("name");
        Document plant = new Document("_id", plantId).append("user_email", userEmail)
                .append("defaultLibraryId", id).append("status", "COMPLETED").append("progress", 100)
                .append("created_at", new Date()).append("error", null)
                .append("obj_file_id", library.get("obj_file_id")).append("mtl_file_id", library.get("mtl_file_id"))
                .append("profile_grid_point_count", profile.get("grid_point_count"))
                .append("total_leaf_area_m2", profile.get("total_leaf_area_m2"))
                .append("parameters", new Document("plant_name", plantName)
                        .append("model", "obj_caribu_yplantqmc").append("parameters", profile.get("parameters")));
        profile.append("plant_id", plantId.toHexString()).append("plant_name", plantName)
                .append("recorded_at", new Date());
        mongo.insert(plant, "plants");
        try {
            mongo.insert(profile, "plant_profile_grids");
        } catch (RuntimeException error) {
            release(userEmail, plantId.toHexString());
            throw error;
        }
        return plantId.toHexString();
    }

    public void release(String userEmail, String id) {
        if (id == null || !ObjectId.isValid(id)) return;
        Query query = Query.query(Criteria.where("_id").is(new ObjectId(id))
                .and("user_email").is(userEmail).and("defaultLibraryId").exists(true));
        if (!mongo.exists(query, "plants")) return;
        mongo.remove(Query.query(Criteria.where("plant_id").is(id)), "plant_profile_grids");
        mongo.remove(query, "plants");
    }
}
