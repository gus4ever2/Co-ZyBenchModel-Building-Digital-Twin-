package com.example.cozybench.service.constructionSet;

import com.example.cozybench.document.TempDocument;
import com.example.cozybench.dto.constructionsDTO.ResponseAggregator.ResponseComponentDTO;
import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.CollectionNameMapper;
import com.example.cozybench.model.factory.RegistryResolver;
import com.example.cozybench.model.factory.FactoryInterface;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import com.example.cozybench.repository.constructionSet.TempRepository;
import com.example.cozybench.service.PlantService;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;
import com.mongodb.client.model.Filters;
import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CRUDService {
    private final MongoTemplate mongoTemplate;
    private final TempRepository tempRepository;
    private final RegistryResolver registryResolver;
    private final ValidationService validationService;
    private static final Gson gson = new GsonBuilder().serializeNulls().create();

    public void create(String userEmail, String type) {
        // Find the right Factory
        FactoryInterface<?> factory = this.registryResolver.getFactory(type);

        //
        Map<IdfObjectRecord, TypeEnumInterface> recordMap = factory.createDefault(
                this.validationService.updateName(type, userEmail)
        );

        // Save created Record to Temp Repository
        this.tempRepository.saveAll(
                this.createDocuments(userEmail, recordMap)
        );
    }

    public void update(String userEmail, ResponseComponentDTO componentDTO) {
    }

    public void add(String userEmail,String id, String type) {
        String collectionName = CollectionNameMapper.getCollectionName(type);
        List<Document> documents = this.mongoTemplate.getCollection(collectionName)
                .find(
                    Filters.eq("_id", new ObjectId(id))
                ).into(new ArrayList<>());

        List<TempDocument> tempDocuments = documents.stream()
                .map(document -> {

                    String newName =  this.validationService.updateName(
                            document.get("name").toString()
                            , userEmail);

                    LinkedHashMap<String, String> properties = this.propertiesObjectToLinkedHashMap(document.get("properties"));
                    properties.replace("Name", newName);

                            return  TempDocument.builder()
                                    .id(null)
                                    .userEmail(userEmail)
                                    .name(newName)
                                    .type(document.get("type").toString())
                                    .properties(properties)
                                    .build();
                        }
                ).collect(Collectors.toUnmodifiableList());

         this.tempRepository.save(tempDocuments.getFirst());
    }

    public void duplicate(String userEmail, String id, String type) {
        // Find document from Repository
        TempDocument document = this.tempRepository.findByIdAndUserEmail(id, userEmail)
                .orElseThrow(() -> new RuntimeException("Component with id = " + id + " not found"));

        // Find the factory of the object
        FactoryInterface<?> factory = this.registryResolver.getFactory(type);

        // Find the properties to duplicate
        LinkedHashMap<String, String> properties = document.getProperties();

        // Find a new name because two components can have the same name
        String newName = this.validationService.updateName(document.getName(), userEmail);

        // Add the new name
        properties.replace("Name", newName);

        // Create the validation Records
        Map<IdfObjectRecord, TypeEnumInterface> recordMap = factory.createFromProperties(
                properties
        );

        // Save the validated values
        this.tempRepository.saveAll(
                this.createDocuments(userEmail, recordMap)
        );
    }

    public void delete(String userEmail, String id) {
        this.tempRepository.deleteByIdAndUserEmail(id, userEmail);
    }

    private LinkedHashMap<String, String> propertiesObjectToLinkedHashMap(Object propertiesObject) {
        LinkedHashMap<String, String> properties = new LinkedHashMap<>();

        if (!(propertiesObject instanceof Map<?, ?> map)) {
            return properties;
        }

        map.forEach((key, value) -> {
            properties.put(
                    key.toString(),
                    value == null ? "" : value.toString()
            );
        });

        return properties;
    }

    public static LinkedHashMap<String, String> recordToStringHashMap(IdfObjectRecord record) {
        Type mapType = new TypeToken<LinkedHashMap<String, String>>() {}.getType();

        System.out.println(record.toString());

        return gson.fromJson(
                gson.toJson(record),
                mapType
        );
    }

    private List<? extends TempDocument> createDocuments(String userEmail, Map<IdfObjectRecord, TypeEnumInterface> recordMap) {
        return recordMap.keySet().stream()
                .map(record -> TempDocument.builder()
                                .id(null)
                                .userEmail(userEmail)
                                .name(record.Name())
                                .type(recordMap.get(record).getEppyName())
                                .properties(CRUDService.recordToStringHashMap(record))
                                .build()
                ).toList();
    }
}
