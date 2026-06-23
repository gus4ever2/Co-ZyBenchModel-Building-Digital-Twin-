package com.example.cozybench.service.constructionSet;

import com.example.cozybench.dto.constructionsDTO.ResponseAggregator.ResponseComponentListDTO;
import com.example.cozybench.dto.constructionsDTO.ResponseStateDTO;
import com.example.cozybench.dto.constructionsDTO.responsePart.ResponseComponentDescriptorDTO;
import com.example.cozybench.model.enums.ConstructionSetTypeEnum;
import lombok.Getter;
import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class ConstructionSetService extends GeneralService {
    @Getter
    private static final Map<String, String> constructionSetEppyNameToEnumName = GeneralService.getTypesEnumsValues(ConstructionSetTypeEnum.values());
    @Getter
    private static final Set<String> constructionSetTypesEppyName = GeneralService.findTypesEppyName(ConstructionSetTypeEnum.values());

    public ConstructionSetService(MongoTemplate mongoTemplate) {
        super(mongoTemplate);
    }

    public ResponseStateDTO getConstructionSetsState(String userEmail , String id) {
        return ResponseStateDTO.builder()
                .componentDescriptions(this.getConstructionSetDescriptors("temp", userEmail))
                .component(id.equals("0") ? null : this.getComponentById("temp", id, constructionSetEppyNameToEnumName))
                .selectableComponentDescriptions(this.getConstructionDescriptors("temp", userEmail))
                .libraryDescriptions(this.getConstructionSetDescriptors("constructionSet", null))
                .build();
    }

    public ResponseComponentListDTO<ResponseComponentDescriptorDTO> getConstructionSetDescriptors(
            String collectionName,
            String userEmail) {

        List<Document> documents= (userEmail != null) ? this.getComponentFromMongoWithEmail(collectionName, userEmail, constructionSetTypesEppyName) :
                this.getComponentFromMongoWithoutEmail(collectionName, constructionSetTypesEppyName);

        return GeneralService.getDescriptors(documents, constructionSetEppyNameToEnumName);
    }

    public ResponseComponentListDTO<ResponseComponentDescriptorDTO> getConstructionDescriptors(
            String collectionName,
            String userEmail) {

        List<Document> documents = this.getComponentFromMongoWithEmail(collectionName, userEmail, ConstructionService.getConstructionTypesEppyName());

        return GeneralService.getDescriptors(documents, constructionSetEppyNameToEnumName);
    }
}
