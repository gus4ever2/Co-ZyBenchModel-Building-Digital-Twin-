package com.cozybench.plant.service;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

/** Installs the explicitly selected plant bundles, without importing old grids. */
@Component
public class PlantLibrarySeeder implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(PlantLibrarySeeder.class);
    private record Bundle(String key, String model) { }
    private static final List<Bundle> BUNDLES = List.of(
            new Bundle("spathiphyllum", "spathiphyllum_green_wall_1m2"),
            new Bundle("aglaonema", "aglaonema_commutatum_green_wall_1m2")
    );

    private final MongoTemplate mongo;
    private final GridFsTemplate files;

    public PlantLibrarySeeder(MongoTemplate mongo) {
        this.mongo = mongo;
        this.files = new GridFsTemplate(mongo.getMongoDatabaseFactory(), mongo.getConverter(), "plant_models");
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        for (Bundle bundle : BUNDLES) install(bundle);
    }

    private void install(Bundle bundle) throws Exception {
        String root = "data/library/plants/" + bundle.key() + "/";
        String model = bundle.model();
        ClassPathResource seedFile = new ClassPathResource(root + "plant.json");
        if (!seedFile.exists()) {
            log.info("Current {} bundle is not available; skipping plant library import.", bundle.key());
            return;
        }

        Document seed;
        try (InputStream input = seedFile.getInputStream()) {
            seed = Document.parse(new String(input.readAllBytes(), StandardCharsets.UTF_8));
        }
        if (!bundle.key().equals(seed.getString("key")) || seed.get("profile", Document.class) == null) {
            throw new IllegalStateException("Invalid plant library bundle: " + bundle.key());
        }
        Query byKey = Query.query(Criteria.where("key").is(bundle.key()));
        Document existing = mongo.findOne(byKey, Document.class, "plantLibrary");
        if (existing != null && (root + model + ".obj").equals(existing.getString("objResource"))
                && seed.get("profile", Document.class).equals(existing.get("profile", Document.class))) {
            return;
        }

        ObjectId objId = null;
        ObjectId mtlId = null;
        try {
            try (InputStream obj = new ClassPathResource(root + model + ".obj").getInputStream();
                 InputStream mtl = new ClassPathResource(root + model + ".mtl").getInputStream()) {
                objId = files.store(obj, model + ".obj", "text/plain");
                mtlId = files.store(mtl, model + ".mtl", "text/plain");
            }
            seed.put("objResource", root + model + ".obj");
            seed.put("mtlResource", root + model + ".mtl");
            seed.put("obj_file_id", objId);
            seed.put("mtl_file_id", mtlId);
            seed.put("created_at", new Date());
            if (existing == null) {
                mongo.insert(seed, "plantLibrary");
            } else {
                // Preserve the library ID and old GridFS files used by earlier runs.
                seed.put("_id", existing.get("_id"));
                mongo.save(seed, "plantLibrary");
            }
        } catch (Exception error) {
            // Remove only files created by this unsuccessful import attempt.
            if (objId != null) files.delete(Query.query(Criteria.where("_id").is(objId)));
            if (mtlId != null) files.delete(Query.query(Criteria.where("_id").is(mtlId)));
            throw error;
        }
        log.info("Installed {} in the plant library.", bundle.key());
    }
}
