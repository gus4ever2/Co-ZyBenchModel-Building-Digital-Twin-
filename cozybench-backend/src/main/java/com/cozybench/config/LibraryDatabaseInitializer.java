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
        mongoTemplate.indexOps(SIMULATIONS_COLLECTION).createIndex(
                new Index()
                        .on("user_email", ASC)
                        .on("display_name", ASC)
                        .named("uq_simulation_user_email_display_name")
                        .unique()
                        .partial(PartialIndexFilter.of(
                                new Document("user_email", new Document("$type", "string"))
                                        .append("display_name", new Document("$type", "string"))
                        ))
        );

        LOGGER.info(
                "Ensured unique simulation index for user_email and display_name"
        );
    }
}
