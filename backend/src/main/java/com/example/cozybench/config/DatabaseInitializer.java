package com.example.cozybench.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;
import org.bson.Document;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import com.mongodb.client.model.IndexOptions;
import org.bson.Document;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseInitializer implements ApplicationRunner {

    private final MongoTemplate mongoTemplate;

    @Override
    public void run(ApplicationArguments args) {
        createCollectionIfMissing("material");
        createCollectionIfMissing("construction");
        createCollectionIfMissing("constructionSet");
        createCollectionIfMissing("schedule");
        createCollectionIfMissing("spacesCZ4");
        createCollectionIfMissing("spaceType");
        createCollectionIfMissing("plant");

        createUniqueUserEmailNameIndex("temp");

    }

    private void createCollectionIfMissing(String collectionName) {
        if (!mongoTemplate.collectionExists(collectionName)) {
            mongoTemplate.createCollection(collectionName);
        }
        this.fillCollectionIfEmpty(collectionName);
    }

    private void fillCollectionIfEmpty(String collectionName) {
        long count = mongoTemplate
                .getCollection(collectionName)
                .countDocuments();

        if (count > 0) {
            System.out.println(
                    "Skip fill. Collection already has " + count + " documents: " + collectionName
            );
            return;
        }

        this.fillCollection(collectionName);
    }

    private void createUniqueUserEmailNameIndex(String collectionName) {
        String indexName = "userEmail_name_unique";

        boolean indexExists = mongoTemplate
                .getCollection(collectionName)
                .listIndexes()
                .into(new ArrayList<>())
                .stream()
                .anyMatch(index -> indexName.equals(index.getString("name")));

        if (indexExists) {
            System.out.println("Index already exists: " + indexName + " for collection: " + collectionName);
            return;
        }

        Document indexKeys = new Document()
                .append("userEmail", 1)
                .append("name", 1);

        IndexOptions indexOptions = new IndexOptions()
                .unique(true)
                .name(indexName);

        mongoTemplate
                .getCollection(collectionName)
                .createIndex(indexKeys, indexOptions);

        System.out.println("Created unique index on userEmail + name for: " + collectionName);
    }

    private void fillCollection(String collectionName) {
        ClassPathResource resource =
                new ClassPathResource("data/" + collectionName + ".json");

        String json = null;

        try (InputStream inputStream = resource.getInputStream()) {
            json = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
        }
        catch (IOException e) {
            System.out.println("Error reading " + collectionName + ".json");
            return;
        }

        List<Document> documents = Document.parse("{\"items\":" + json + "}")
                .getList("items", Document.class);

        this.mongoTemplate.getCollection(collectionName).insertMany(documents);
    }
}
