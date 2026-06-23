package com.example.cozybench.service.constructionSet;

import com.example.cozybench.dto.constructionsDTO.ResponseAggregator.ResponseComponentDTO;
import com.example.cozybench.dto.constructionsDTO.ResponseAggregator.ResponseComponentListDTO;
import com.example.cozybench.dto.constructionsDTO.responsePart.ResponseComponentDescriptorDTO;
import com.example.cozybench.model.TypeEnumInterface;
import com.mongodb.client.model.Filters;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;
import org.bson.Document;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GeneralService {

    private final MongoTemplate mongoTemplate;

    public static <EnumTypes extends Enum<EnumTypes> & TypeEnumInterface>
    HashMap<String, String> getTypesEnumsValues(EnumTypes[] enumsValues) {

        return Arrays.stream(enumsValues)
                .collect(Collectors.toMap(
                        TypeEnumInterface::getEppyName,
                        Enum::toString,
                        (oldValue, newValue) -> oldValue,
                        HashMap::new
                ));
    }

    public static <EnumTypes extends Enum<EnumTypes> & TypeEnumInterface>
    Set<String> findTypesEppyName(EnumTypes[] enumsValues) {
        return Arrays.stream(enumsValues)
                .map(TypeEnumInterface::getEppyName)
                .collect(Collectors.toSet());
    }

    public static ResponseComponentListDTO<ResponseComponentDescriptorDTO> getDescriptors(List<? extends Document> documents, Map<String, String> eppyNameToEnumName) {
        return new ResponseComponentListDTO( documents.stream()
                .map(document->
                        ResponseComponentDescriptorDTO.builder()
                                .id(document.get("_id").toString())
                                .type(eppyNameToEnumName.get(document.get("type").toString()))
                                .name(document.get("name").toString())
                                .build()
                )
                .collect(
                        ArrayList<ResponseComponentDescriptorDTO>::new,
                        ArrayList<ResponseComponentDescriptorDTO>::add,
                        ArrayList<ResponseComponentDescriptorDTO>::addAll
                )
        );
    }

    public List<Document> getComponentFromMongoWithEmail(String collectionName, String userEmail, Set<String> typesEppyName) {
        return this.mongoTemplate.getCollection(collectionName).find(
                Filters.and(
                        Filters.in("type", typesEppyName),
                        Filters.eq("userEmail", userEmail)
                )
        ).into(new ArrayList<>());
    }

    public List<Document> getComponentFromMongoWithoutEmail(String collectionName, Set<String> typesEppyName) {
        List<Document> documents = this.mongoTemplate.getCollection(collectionName).find(
                Filters.in("type", typesEppyName)
        ).into(new ArrayList<>());
        //System.out.println(documents);

        return documents;
    }

    private Optional<Document> findById(String collectionName, String id) {
        Document document = this.mongoTemplate
                .getCollection(collectionName)
                .find(Filters.eq("_id", new ObjectId(id)))
                .first();

        return Optional.ofNullable(document);
    }

    protected ResponseComponentDTO getComponentById(String collectionName, String id, Map<String, String> eppyNameToEnumName) {

        Optional<Document> documentOptional = findById(collectionName, id);

        return documentOptional
                .map(document -> ResponseComponentDTO.builder()
                        .id(document.get("_id").toString())
                        .type(eppyNameToEnumName.get(document.get("type").toString()))
                        .properties(this.toLinkedHashMapString(document.get("properties")))
                        .build()
                )
                .orElseThrow(() -> new RuntimeException("Component not found with id: " + id));
    }

    private LinkedHashMap<String, String> toLinkedHashMapString(Object propertiesObject) {
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
}
