package com.example.cozybench.service.constructionSet;

import com.example.cozybench.document.*;
import com.example.cozybench.dto.constructionsDTO.ResponseAggregator.ResponseComponentListDTO;
import com.example.cozybench.dto.constructionsDTO.responsePart.ResponseComponentDescriptorDTO;
import com.example.cozybench.model.enums.ConstructionTypeEnum;
import com.example.cozybench.model.enums.MaterialTypeEnum;
import com.example.cozybench.repository.constructionSet.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ConstructionsFromMongoLibraryService {

    private final ConstructionSetRepository constructionSetRepository;
    private final ConstructionRepository constructionRepository;
    private final MaterialRepository materialRepository;
    private final WindowMaterialRepository windowMaterialRepository;
    private final TempRepository tempRepository;

    public ResponseComponentListDTO<ResponseComponentDescriptorDTO> getConstructionSetDescriptorsFromLibrary() {
        Map<String, String> eppyNameToEnumName = GeneralService.getTypesEnumsValues(MaterialTypeEnum.values());
        return new ResponseComponentListDTO(this.getDescriptorsFromLibrary(this.constructionSetRepository,eppyNameToEnumName));
    }

    public ResponseComponentListDTO<ResponseComponentDescriptorDTO> getConstructionsDescriptorsFromLibrary() {
        Map<String, String> eppyNameToEnumName = GeneralService.getTypesEnumsValues(ConstructionTypeEnum.values());
        return new ResponseComponentListDTO(this.getDescriptorsFromLibrary(this.constructionRepository, eppyNameToEnumName));
    }

    public ResponseComponentListDTO<ResponseComponentDescriptorDTO> getMaterialsDescriptorsFromLibrary() {
        Map<String, String> eppyNameToEnumName = GeneralService.getTypesEnumsValues(MaterialTypeEnum.values());

        List<ResponseComponentDescriptorDTO> descriptors = new ArrayList<>();

        descriptors.addAll(this.getDescriptorsFromLibrary(this.materialRepository, eppyNameToEnumName));
        descriptors.addAll(this.getDescriptorsFromLibrary(this.windowMaterialRepository, eppyNameToEnumName));

        return new ResponseComponentListDTO(descriptors);
    }

    public ArrayList<ResponseComponentDescriptorDTO> getDescriptorsFromLibrary(MongoRepository<? extends BaseConstructionsDocument, String> repository, Map<String, String> eppyNameToEnumName) {

        return repository.findAll().stream()
                        .map(document ->
                                ResponseComponentDescriptorDTO.builder()
                                        .id(document.getId())
                                        .type(eppyNameToEnumName.get(document.getType()))
                                        .name(document.getName())
                                        .build()
                        )
                        .collect(
                                ArrayList<ResponseComponentDescriptorDTO>::new,
                                ArrayList<ResponseComponentDescriptorDTO>::add,
                                ArrayList<ResponseComponentDescriptorDTO>::addAll
                        );
    }
}
