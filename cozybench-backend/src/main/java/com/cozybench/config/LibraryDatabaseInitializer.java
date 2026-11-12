package com.cozybench.config;

import com.cozybench.config.library.LibrarySeedImportCoordinator;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.data.mongodb.core.index.PartialIndexFilter;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

import java.util.List;

import static org.springframework.data.domain.Sort.Direction.ASC;

@Component
public class LibraryDatabaseInitializer implements ApplicationRunner {

    private static final String SIMULATIONS_COLLECTION = "simulations";

    private static final Logger LOGGER =
            LoggerFactory.getLogger(LibraryDatabaseInitializer.class);

    private final MongoTemplate mongoTemplate;
    private final LibrarySeedImportCoordinator librarySeedCoordinator;

    public LibraryDatabaseInitializer(
            MongoTemplate mongoTemplate,
            LibrarySeedImportCoordinator librarySeedCoordinator
    ) {
        this.mongoTemplate = mongoTemplate;
        this.librarySeedCoordinator = librarySeedCoordinator;
    }

    @Override
    public void run(ApplicationArguments args) {
        initializeBuildingLibrary();
        initializeSimulationIndexes();
    }

    private void initializeBuildingLibrary() {
        String collection = "buildingLibraryObjects";
        // Validate every relationship before the first document is saved.
        List<Document> objects = librarySeedCoordinator.prepareLibrary();
        if (!mongoTemplate.collectionExists(collection)) {
            mongoTemplate.createCollection(collection);
        }
        mongoTemplate.indexOps(collection).createIndex(new Index().on("nameKey", ASC).unique());
        long existingCount = mongoTemplate.getCollection(collection).countDocuments();
        // Seed an empty library only; never replace an existing library on restart.
        if (existingCount == 0) {
            mongoTemplate.getCollection(collection).insertMany(objects);
            LOGGER.info("Initialized linked building library with {} objects", objects.size());
        } else if (existingCount < objects.size()) {
            // Avoid silently combining an incomplete library with a different seed.
            throw new IllegalStateException("Building library is incomplete; refusing to mix seed versions");
        }
    }

    private void initializeSimulationIndexes() {
        migrateSimulationOwnership();
        migratePlantOwnership();
        if (mongoTemplate.collectionExists(SIMULATIONS_COLLECTION)) {
            mongoTemplate.updateMulti(
                    new Query(org.springframework.data.mongodb.core.query.Criteria.where("user_email").exists(true)),
                    new Update().unset("user_email").unset("guest_session_id"),
                    SIMULATIONS_COLLECTION
            );
        }
        if (mongoTemplate.collectionExists("plants")) {
            mongoTemplate.updateMulti(
                    new Query(org.springframework.data.mongodb.core.query.Criteria.where("owner_type").exists(true)
                            .and("user_email").exists(true)),
                    new Update().unset("user_email"),
                    "plants"
            );
        }
        if (mongoTemplate.collectionExists("simulation_timesteps")) {
            // A timestep is a child of its simulation. The parent record is the
            // authorization boundary, so timesteps do not duplicate owner data.
            mongoTemplate.updateMulti(
                    new Query(org.springframework.data.mongodb.core.query.Criteria.where("user_email").exists(true)),
                    new Update().unset("user_email"),
                    "simulation_timesteps"
            );
        }
        mongoTemplate.indexOps(SIMULATIONS_COLLECTION).createIndex(
                new Index()
                        .on("owner_type", ASC)
                        .on("owner_id", ASC)
                        .on("display_name", ASC)
                        .named("uq_simulation_owner_display_name")
                        .unique()
                        .partial(PartialIndexFilter.of(
                                new Document("owner_type", new Document("$type", "string"))
                                        .append("owner_id", new Document("$type", "string"))
                                        .append("display_name", new Document("$type", "string"))
                        ))
        );

        LOGGER.info(
                "Ensured unique simulation index for owner_type, owner_id and display_name"
        );
    }

    private void migrateSimulationOwnership() {
        if (!mongoTemplate.collectionExists(SIMULATIONS_COLLECTION)) return;
        var legacy = mongoTemplate.find(
                new Query(org.springframework.data.mongodb.core.query.Criteria.where("owner_type").exists(false)),
                Document.class,
                SIMULATIONS_COLLECTION
        );
        for (Document simulation : legacy) {
            String email = string(simulation.get("user_email"));
            String ownerId = string(simulation.get("owner_id"));
            String ownerType;
            if (email != null && !email.isBlank()) {
                ownerType = "USER";
                if (ownerId == null || ownerId.isBlank()) ownerId = userIdForEmail(email);
                if (ownerId == null || ownerId.isBlank()) ownerType = "GUEST";
            } else {
                ownerType = "GUEST";
                if (ownerId == null || ownerId.isBlank()) {
                    ownerId = string(simulation.get("guest_session_id"));
                }
            }
            if (ownerId == null || ownerId.isBlank()) {
                // No email/session/user ID means no recoverable owner. Mark it
                // as an isolated guest record so the scheduled cleanup removes it.
                ownerType = "GUEST";
                ownerId = string(simulation.get("_id"));
            }
            if (ownerId == null || ownerId.isBlank()) {
                LOGGER.warn("Leaving simulation {} without a usable owner key", simulation.get("_id"));
                continue;
            }
            mongoTemplate.updateFirst(
                    Query.query(org.springframework.data.mongodb.core.query.Criteria.where("_id").is(simulation.get("_id"))),
                    new Update().set("owner_type", ownerType).set("owner_id", ownerId)
                            .unset("user_email").unset("guest_session_id"),
                    SIMULATIONS_COLLECTION
            );
        }
    }

    private void migratePlantOwnership() {
        if (!mongoTemplate.collectionExists("plants")) return;
        var legacy = mongoTemplate.find(
                new Query(org.springframework.data.mongodb.core.query.Criteria.where("owner_type").exists(false)
                        .and("user_email").type(2)),
                Document.class,
                "plants"
        );
        for (Document plant : legacy) {
            String ownerId = userIdForEmail(string(plant.get("user_email")));
            if (ownerId == null) continue;
            mongoTemplate.updateFirst(
                    Query.query(org.springframework.data.mongodb.core.query.Criteria.where("_id").is(plant.get("_id"))),
                    new Update().set("owner_type", "USER").set("owner_id", ownerId).unset("user_email"),
                    "plants"
            );
        }
    }

    private String userIdForEmail(String email) {
        if (email == null || email.isBlank()) return null;
        Document user = mongoTemplate.findOne(
                Query.query(org.springframework.data.mongodb.core.query.Criteria.where("email").is(email)),
                Document.class,
                "users"
        );
        return user == null ? null : string(user.get("_id"));
    }

    private String string(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
