package com.example.cozybench.service.addFromLibrary;

import com.example.cozybench.document.TempDocument;
import com.example.cozybench.repository.constructionSet.TempRepository;
import com.example.cozybench.service.constructionSet.ValidationService;
import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;
import java.util.*;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.in;

@Service
@RequiredArgsConstructor
public abstract class ImportComponentFromLibrary {
    protected final ValidationService validationService;
    protected final TempRepository tempRepository;
    protected final MongoTemplate mongoTemplate;
    protected LinkedHashMap<String, String> namesToChange;
    protected TempDocument tempDocument;
    protected List<TempDocument> addedDocuments;

    public TempDocument addFromLibrary(String collectionName, String id, String userEmail) {

        Document document = Optional.ofNullable(
                this.mongoTemplate
                        .getCollection(collectionName)
                        .find(eq("_id", new ObjectId(id)))
                        .first()
        ).orElseThrow(() -> new RuntimeException("Component with id: " + id + " not found in collection: " + collectionName));

        // Validate Name
        String oldName = document.getString("name");
        String type = document.getString("type");
        String newName = this.validationService.updateName(oldName, userEmail);

        this.tempDocument = convertToTempDocument(
                userEmail,
                newName,
                type,
                getPropertiesAsLinkedHashMap(document)
        );

        return this.tempDocument;
    }

    protected List<TempDocument> importTheNecessaryComponents(
            List<String> layerKeys,
            TempDocument tempDocument,
            String collectionName,
            String userEmail
    ) {
        // Find every material Name
        this.findNamesToImport(layerKeys, tempDocument);

        // Find every component which should be in temp Repository
        List<Document> documents = this.mongoTemplate.getCollection(collectionName)
                .find(in("properties.Name", this.namesToChange.keySet()))
                .into(new LinkedList<>());
        this.addComponentIfDontExists(documents, userEmail);

        return this.addedDocuments;
    }

    private void addComponentIfDontExists(List<Document> documents, String userEmail) {
        // components needed from the main component
        documents.forEach(document -> {
            // finds the name of the component
            String name = document.getString("name");
            String type = document.getString("type");
            // finds the document in the Temp Repository base on the name and email
            this.tempRepository.findAllByUserEmailAndName(userEmail, name)
                    .ifPresentOrElse(
                            // checks if the name exists
                            documentInTemp -> {
                                LinkedHashMap<String, String> firstProperties = this.getPropertiesAsLinkedHashMap(document);
                                firstProperties = this.deleteBlackFromProperties(firstProperties);
                                LinkedHashMap<String, String> secondProperties = documentInTemp.getProperties();
                                secondProperties = this.deleteBlackFromProperties(secondProperties);
                                boolean exists = this.haveSameProperties(firstProperties, secondProperties);
                                // If it doesn't exist, but it has the same name save it
                                if (!exists) {
                                    String newName = this.validationService.updateName(name, userEmail);
                                    LinkedHashMap<String, String> properties = this.getPropertiesAsLinkedHashMap(document);
                                    properties.replace("Name", newName);
                                    LinkedHashMap<String, String> filteredProperties = this.deleteBlackFromProperties(properties);

                                    // change name in parent component
                                    String label = this.namesToChange.get(name);
                                    LinkedHashMap<String, String> parentProperties = this.tempDocument.getProperties();
                                    parentProperties.replace(label, newName);
                                    this.tempDocument.setProperties(parentProperties);

                                    TempDocument tempDocumentToAdd = this.convertToTempDocument(
                                            userEmail,
                                            newName,
                                            type,
                                            filteredProperties
                                    );

                                    this.tempRepository.save(tempDocumentToAdd);
                                    this.addedDocuments.add(tempDocumentToAdd);
                                }
                            },
                            // else save it
                            () -> {
                                TempDocument tempDocumentToAdd = this.convertToTempDocument(
                                        userEmail,
                                        name,
                                        type,
                                        this.deleteBlackFromProperties(
                                                this.getPropertiesAsLinkedHashMap(document))
                                );
                                this.tempRepository.save(tempDocumentToAdd);
                                this.addedDocuments.add(tempDocumentToAdd);
                            }
                    );
        });
    }

    private TempDocument convertToTempDocument(
            String userEmail,
            String name,
            String type,
            LinkedHashMap<String, String> properties
    ) {
        return TempDocument.builder()
                .id(null)
                .name(name)
                .type(type)
                .userEmail(userEmail)
                .properties(properties)
                .build();
    }


    private void findNamesToImport(List<String> layerKeys, TempDocument tempDocument) {
        this.namesToChange = new LinkedHashMap<>();
        this.addedDocuments = new ArrayList<>();
        layerKeys
                .forEach(layerKey->{
                    String componentName = tempDocument.getProperties().get(layerKey);
                    this.namesToChange.put(componentName, layerKey);
                });
    }

    private LinkedHashMap<String, String> getPropertiesAsLinkedHashMap(Document document) {
        Document propertiesDocument = document.get("properties", Document.class);

        LinkedHashMap<String, String> properties = new LinkedHashMap<>();

        if (propertiesDocument == null) {
            return properties;
        }

        propertiesDocument.forEach((key, value) -> {
            properties.put(key, value == null ? null : value.toString());
        });

        return properties;
    }

    private boolean haveSameProperties(
            LinkedHashMap<String, String> firstProperties,
            LinkedHashMap<String, String> secondProperties
    ) {
        if (firstProperties == null || secondProperties == null) {
            return firstProperties == secondProperties;
        }

        if (!firstProperties.keySet().equals(secondProperties.keySet())) {
            return false;
        }

        return firstProperties.entrySet()
                .stream()
                .allMatch(entry -> {
                    String key = entry.getKey();

                    String firstValue = normalizeValue(entry.getValue());
                    String secondValue = normalizeValue(secondProperties.get(key));

                    return Objects.equals(firstValue, secondValue);
                });
    }

    private String normalizeValue(String value) {
        if (value == null) {
            return null;
        }

        return value.trim();
    }

    protected LinkedHashMap<String, String> deleteBlackFromProperties(LinkedHashMap<String, String> properties) {
        return properties.entrySet()
                .stream()
                .filter(entry -> !entry.getValue().trim().isBlank())
                .collect(
                        LinkedHashMap::new,
                        (map, entry) -> map.put(entry.getKey(), entry.getValue()),
                        LinkedHashMap::putAll
                );
    }
}
