package com.example.cozybench.service.constructionSet;

import com.example.cozybench.dto.constructionsDTO.ResponseAggregator.ResponseComponentListDTO;
import com.example.cozybench.dto.constructionsDTO.ResponseStateDTO;
import com.example.cozybench.dto.constructionsDTO.responsePart.ResponseComponentDescriptorDTO;
import com.example.cozybench.model.enums.PlantEnum;
import lombok.Getter;
import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class PlantDataService extends GeneralService{
    @Getter
    public static final Map<String, String> eppyNameToEnumNamePlant = GeneralService.getTypesEnumsValues(PlantEnum.values());
    public static final Set<String> plantTypesEppyName = GeneralService.findTypesEppyName(PlantEnum.values());

    private final ValidationService validationService;

    public PlantDataService(MongoTemplate mongoTemplate, ValidationService validationService) {
        super(mongoTemplate);
        this.validationService = validationService;
    }

    public ResponseStateDTO getPlantsState(String useEmail , String id) {
        return ResponseStateDTO.builder()
                .componentDescriptions(this.getPlantDescriptors("temp", useEmail))
                .component(id.equals("0") ? null : this.getComponentById("temp", id, PlantDataService.eppyNameToEnumNamePlant))
                .libraryDescriptions(this.getPlantDescriptors("plant",null))
                .build();
    }

    public ResponseComponentListDTO<ResponseComponentDescriptorDTO> getPlantDescriptors(
            String collectionName,
            String userEmail) {

        List<Document> documents = (userEmail != null) ? this.getComponentFromMongoWithEmail(collectionName, userEmail, plantTypesEppyName) :
                this.getComponentFromMongoWithoutEmail(collectionName, plantTypesEppyName);

        return GeneralService.getDescriptors(documents, eppyNameToEnumNamePlant);
    }
}
