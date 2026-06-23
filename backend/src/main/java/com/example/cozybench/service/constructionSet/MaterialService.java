package com.example.cozybench.service.constructionSet;

import com.example.cozybench.document.TempDocument;
import com.example.cozybench.dto.constructionsDTO.ResponseAggregator.ResponseComponentDTO;
import com.example.cozybench.dto.constructionsDTO.ResponseAggregator.ResponseComponentListDTO;
import com.example.cozybench.dto.constructionsDTO.ResponseStateDTO;
import com.example.cozybench.dto.constructionsDTO.responsePart.ResponseComponentDescriptorDTO;
import com.example.cozybench.model.enums.MaterialTypeEnum;
import com.example.cozybench.model.enums.WindowMaterialTypeEnum;
import lombok.Getter;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.bson.Document;
import java.util.*;
import java.util.stream.Stream;

@Service
public class MaterialService extends GeneralService {
    //private final TempRepository tempRepository;
    @Getter
    public static final Map<String, String> eppyNameToEnumNameMaterial = GeneralService.getTypesEnumsValues(MaterialTypeEnum.values());
    public static final Set<String> materialTypesEppyName = GeneralService.findTypesEppyName(MaterialTypeEnum.values());
    public static final Map<String, String> eppyNameToEnumNameWindowMaterial = GeneralService.getTypesEnumsValues(WindowMaterialTypeEnum.values());
    public static final Set<String> windowMaterialTypesEppyName = GeneralService.findTypesEppyName(WindowMaterialTypeEnum.values());
    private final ConstructionsFromMongoLibraryService constructionsFromMongoLibraryService;

    private final ValidationService validationService;

    public MaterialService(MongoTemplate mongoTemplate, ValidationService validationService, ConstructionsFromMongoLibraryService constructionsFromMongoLibraryService) {
        super(mongoTemplate);
        this.constructionsFromMongoLibraryService = constructionsFromMongoLibraryService;
        this.validationService = validationService;
    }

    public void updateMaterialService(ResponseComponentDTO componentDTO, String userEmail) {
        System.out.println(componentDTO);
        boolean validation = this.validationService.validate(componentDTO, userEmail);

        //if (validation) {
            //this.tempRepository.up
        //}
    }

    public ResponseStateDTO getMaterialsFromTempRepository(Authentication authentication , String id) {
        return ResponseStateDTO.builder()
                .componentDescriptions(this.getMaterialsDescriptors("temp", "temp", authentication.getName()))
                .component(id.equals("0") ? null : this.getComponentById("temp", id, this.getEppyNameToEnumName()))
                .libraryDescriptions(this.getMaterialsDescriptors("material", "material",null))
                .build();
    }

    private Map<String, String> getEppyNameToEnumName() {
        Map<String, String> eppyNameToEnumName = new HashMap<>();

        eppyNameToEnumName.putAll(eppyNameToEnumNameMaterial);
        eppyNameToEnumName.putAll(eppyNameToEnumNameWindowMaterial);

        return eppyNameToEnumName;
    }

    public ResponseComponentListDTO<ResponseComponentDescriptorDTO> getMaterialsDescriptors(
            String collectionNameMaterial,
            String collectionNameWindowMaterial,
            String userEmail) {

        List<Document> documentMaterials = (userEmail != null) ? this.getComponentFromMongoWithEmail(collectionNameMaterial, userEmail, materialTypesEppyName) :
                this.getComponentFromMongoWithoutEmail(collectionNameMaterial, materialTypesEppyName);
        List<Document> documentWindowMaterials = (userEmail != null) ? this.getComponentFromMongoWithEmail(collectionNameWindowMaterial, userEmail, windowMaterialTypesEppyName) :
                this.getComponentFromMongoWithoutEmail(collectionNameWindowMaterial, windowMaterialTypesEppyName);

        ResponseComponentListDTO<ResponseComponentDescriptorDTO> materialDescriptors = GeneralService.getDescriptors(documentMaterials, eppyNameToEnumNameMaterial);
        ResponseComponentListDTO<ResponseComponentDescriptorDTO> windowMaterialDescriptors = GeneralService.getDescriptors(documentWindowMaterials, eppyNameToEnumNameWindowMaterial);

        return new ResponseComponentListDTO<>(
                Stream.concat(
                        materialDescriptors.componentParts().stream(),
                        windowMaterialDescriptors.componentParts().stream()
                ).toList()
        );
    }
}