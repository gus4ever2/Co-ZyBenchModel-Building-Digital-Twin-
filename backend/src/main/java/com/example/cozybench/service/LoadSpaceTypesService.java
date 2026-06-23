package com.example.cozybench.service;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Filters;
import com.mongodb.client.result.DeleteResult;
import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import java.lang.reflect.Type;
import java.util.*;
import java.util.regex.Pattern;

import static com.mongodb.client.model.Filters.*;

@Service
public class LoadSpaceTypesService {

    private LinkedHashMap<String, String> spacesMap;
    private final MongoTemplate mongoTemplate;
    private final MongoCollection<Document> spaceTypeCollection;
    private final MongoCollection<Document> scheduleCollection;
    private final MongoCollection<Document> tempCollection;
    private final MongoCollection<Document>  spacesCZ4Collection;
    private final List<String> loadTypes = this.loadTypes();
    private static final List<String> SPACE_RELATED_TYPES = List.of(
            "LIGHTS",
            "PEOPLE",
            "ELECTRICEQUIPMENT",
            "ZONEINFILTRATION:DESIGNFLOWRATE",
            "SPACELIST",
            "SPACE",
            "SCHEDULE:YEAR",
            "SCHEDULE:DAY:INTERVAL",
            "SCHEDULE:WEEK:DAILY"
    );

    LoadSpaceTypesService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
        this.spaceTypeCollection = this.mongoTemplate.getCollection("spaceType");
        this.scheduleCollection = this.mongoTemplate.getCollection("schedule");
        this.tempCollection = this.mongoTemplate.getCollection("temp");
        this.spacesCZ4Collection = this.mongoTemplate.getCollection("spacesCZ4");
    }

    public long deleteSpaceRelatedComponents(String userEmail) {
        DeleteResult result = tempCollection.deleteMany(
                and(
                        eq("userEmail", userEmail),
                        in("type", SPACE_RELATED_TYPES)
                )
        );

        return result.getDeletedCount();
    }


    private FindIterable<Document> findParts(String userEmail, String name, MongoCollection<Document> collection, List<String> oldIdfObjects) {
        // delete old loads
        oldIdfObjects.forEach(typeName ->
                this.tempCollection.deleteMany(
                        and(
                        Filters.regex("type", "^" + typeName),
                        eq("userEmail", userEmail)
                ))
        );

        FindIterable<Document> documents = collection.find(
                Filters.regex("name", "^" + Pattern.quote(name))
        );

        List<Document> documentList = new ArrayList<>();

        for (Document document : documents) {
            documentList.add(new Document()
                    .append("userEmail", userEmail)
                    .append("name", document.getString("name"))
                    .append("type", document.getString("type"))
                    .append("properties", document.get("properties", Document.class))
            );
        }

        if (!documentList.isEmpty()) {
            this.tempCollection.insertMany(documentList);
        }
        else{
            throw new RuntimeException("At least one of these IDF objects not found: " + name);
        }

        return documents;
    }

    private void findSchedulesNamesAndSaveSpaceTypes (HashSet<String> ScheduleSet, String userEmail, String name, MongoCollection<Document> collection, List<String> oldIdfObjects) {
        FindIterable<Document> documents = this.findParts(userEmail, name, collection, oldIdfObjects);

        for (Document document : documents) {
            Document properties = (Document) document.get("properties");

            System.out.println(document);


            if (document.get("type").equals("PEOPLE")) {
                System.out.println(properties.get("Number_of_People_Schedule_Name"));
                ScheduleSet.add(properties.get("Number_of_People_Schedule_Name").toString());

            }
            else{
                System.out.println(properties.get("Schedule_Name"));
                ScheduleSet.add(properties.get("Schedule_Name").toString());
            }

        }
    }

    public void findEverySchedule(String userEmail, String spacesJson) {

        this.deleteSpaceRelatedComponents(userEmail);

        this.extractSpaces(spacesJson);

        HashMap<String, Document> spaceListMap = new HashMap<>();
        HashSet<String> ScheduleSet = new HashSet<>();

        //SpaceList,
        //        SpaceType-OfficeL,                      !- Name
        //Space OfficeL;                          !- Space Name 1

        for (Map.Entry<String, String> entry : this.spacesMap.entrySet()) {
            String spaceName = entry.getKey();
            String spaceTypeName = entry.getValue();

            this.saveSpaces(userEmail, spaceName, spaceTypeName);

            if (!spaceListMap.containsKey(spaceTypeName)) {

                spaceListMap.put(spaceTypeName,
                        new Document()
                                .append("counter", 1)
                                .append("Name", spaceTypeName)
                                .append("Space_1_Name", spaceName)
                );

                this.findSchedulesNamesAndSaveSpaceTypes(ScheduleSet, userEmail, spaceTypeName, this.spaceTypeCollection,
                        this.loadTypes
                );

            } else {
                Document document = spaceListMap.get(spaceTypeName);
                int c = (int) document.get("counter") + 1;
                document.append("Space_" + c + "_Name", spaceName);
                document.put("counter", c);
            }
        }

        this.saveSpaceTypes(userEmail, spaceListMap.values().stream().toList());

        System.out.println(ScheduleSet);

        ScheduleSet.forEach(scheduleType -> {
            this.findParts(userEmail, scheduleType, this.scheduleCollection,
                    List.of("SCHEDULE")
            );
        });


    }

    private void saveSpaceTypes(String userEmail, List<Document> documents) {

        this.tempCollection.deleteMany(
                and(
                        Filters.regex("type", "^" + "SPACELIST"),
                        eq("userEmail", userEmail)
                ));

        this.tempCollection.insertMany(
                this.organizeDocument(userEmail,
                        documents
                )
        );
    }

    private List<Document> organizeDocument(String userEmail, List<Document> documents) {
        return documents.stream()
                .map(document -> {
                            document.remove("counter");
                            return new Document()
                                    .append("userEmail", userEmail)
                                    .append("name", document.get("Name"))
                                    .append("type", "SPACELIST")
                                    .append("properties", document);
                        }
                )
        .toList();
    }

    private List<String> loadTypes(){
        return List.of(
                "LIGHTS",
                "PEOPLE",
                "ELECTRICEQUIPMENT",
                "ZONEINFILTRATION:DESIGNFLOWRATE"
        );
    }

    private void extractSpaces(String spacesJson) {
        Gson gson = new Gson();
        Type type = new TypeToken<LinkedHashMap<String, String>>() {
        }.getType();
        this.spacesMap = gson.fromJson(spacesJson, type);
    }

    private void saveSpaces(String userEmail, String spaceName, String spaceTypeName) {
        Document document = this.spacesCZ4Collection
                .find(eq("name", spaceName))
                .first();

        Map<String, String> properties = (Map<String, String>) document.get("properties");

        properties.put("Space_Type",  spaceTypeName);

        Document newDocument = new Document()
                .append("userEmail", userEmail)
                .append("name", document.get("name"))
                .append("type", "SPACE")
                .append("properties", properties);

        this.tempCollection.insertOne(newDocument);
    }
}
