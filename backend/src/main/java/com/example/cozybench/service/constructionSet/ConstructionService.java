package com.example.cozybench.service.constructionSet;

import com.example.cozybench.document.TempDocument;
import com.example.cozybench.dto.constructionsDTO.ResponseAggregator.ResponseComponentDTO;
import com.example.cozybench.dto.constructionsDTO.ResponseAggregator.ResponseComponentListDTO;
import com.example.cozybench.dto.constructionsDTO.ResponseStateDTO;
import com.example.cozybench.dto.constructionsDTO.responsePart.ResponseComponentDescriptorDTO;
import com.example.cozybench.model.enums.ConstructionTypeEnum;
import com.example.cozybench.repository.constructionSet.TempRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ConstructionService {
    @Getter
    private static final Map<String, String> constructionEppyNameToEnumName = GeneralService.getTypesEnumsValues(ConstructionTypeEnum.values());
    @Getter
    private static final Set<String> constructionTypesEppyName = GeneralService.findTypesEppyName(ConstructionTypeEnum.values());
    private final TempRepository tempRepository;
    private final ConstructionsFromMongoLibraryService constructionsFromMongoLibraryService;
    private final MaterialService materialService;

    public ResponseStateDTO getConstructionsState(String userEmail , String id) {
        List<TempDocument> documents = this.tempRepository.findAllByUserEmailAndTypeIn(
                userEmail,
                ConstructionService.constructionTypesEppyName
        );

        return ResponseStateDTO.builder()
                .componentDescriptions(this.getComponentDescriptorsList(documents))
                .component(this.getConstructionById(userEmail, documents, id))
                .libraryDescriptions(this.constructionsFromMongoLibraryService.getConstructionsDescriptorsFromLibrary())
                .selectableComponentDescriptions(materialService.getMaterialsDescriptors("temp", "temp", userEmail))
                .build();
    }

    private ResponseComponentDTO getConstructionById(String userEmail, List<TempDocument> documents, String id) {
        if (id.equals("0")) {
            return null;
        }

        TempDocument document = this.tempRepository.findByUserEmailAndId(
                userEmail,
                id
        ).orElseThrow(() -> new RuntimeException("Component not found with id: " + id));

        return ResponseComponentDTO.builder()
                .id(document.getId())
                .type(this.categorizeConstruction(documents, document))
                .properties(document.getProperties())
                .build();
    }

    protected ResponseComponentListDTO<ResponseComponentDescriptorDTO> getComponentDescriptorsList(List<TempDocument> documents) {

        return new ResponseComponentListDTO<>(
                documents.stream()
                        .map(document ->
                                ResponseComponentDescriptorDTO.builder()
                                        .id(document.getId())
                                        .type(this.categorizeConstruction(documents, document))
                                        .name(document.getName())
                                        .build()
                        )
                        .collect(
                                ArrayList<ResponseComponentDescriptorDTO>::new,
                                ArrayList<ResponseComponentDescriptorDTO>::add,
                                ArrayList<ResponseComponentDescriptorDTO>::addAll
                        )
        );
    }

    private String categorizeConstruction(List<TempDocument> documents, TempDocument document) {
        String type = document.getType();

        if ("CONSTRUCTION".equals(type)) {

            String outsideLayer = document.getProperties().get("Outside_Layer");

            if (outsideLayer == null) {
                return ConstructionTypeEnum.CONSTRUCTION.toString();
            }

            TempDocument outsideLayerDocument = this.tempRepository.findByName(outsideLayer)
                    .orElseThrow(() -> new RuntimeException("TempDocument not found: " + outsideLayer));

            boolean isMaterialConstruction =
                    MaterialService.materialTypesEppyName.contains(outsideLayerDocument.getType());

            boolean hasInternalHeatSource = documents.stream()
                    .filter(doc -> "CONSTRUCTIONPROPERTY:INTERNALHEATSOURCE".equals(doc.getType()))
                    .anyMatch(doc -> document.getName().equals(
                            doc.getProperties().get("Construction_Name")
                    ));

            if (hasInternalHeatSource && isMaterialConstruction) {
                return ConstructionTypeEnum.CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE.toString();
            }

            if (isMaterialConstruction) {
                return ConstructionTypeEnum.CONSTRUCTION.toString();
            }
        }

        return ConstructionService.constructionEppyNameToEnumName.get(type);
    }
}
