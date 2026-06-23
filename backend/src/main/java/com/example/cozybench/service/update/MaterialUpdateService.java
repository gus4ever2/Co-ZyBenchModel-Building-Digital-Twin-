package com.example.cozybench.service.update;

import com.example.cozybench.document.TempDocument;
import com.example.cozybench.dto.constructionsDTO.ResponseAggregator.ResponseComponentDTO;
import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.MaterialTypeEnum;
import com.example.cozybench.model.enums.WindowMaterialTypeEnum;
import com.example.cozybench.repository.constructionSet.TempRepository;
import com.example.cozybench.service.constructionSet.ValidationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class MaterialUpdateService implements UpdateServiceInterface {
    private final ValidationService validationService;
    private final TempRepository tempRepository;

    @Override
    public boolean supports(TypeEnumInterface type) {
        return type instanceof MaterialTypeEnum
                || type instanceof WindowMaterialTypeEnum;
    }

    @Override
    public void update(ResponseComponentDTO dto, String userEmail) {

       this.validationService.validate(dto, userEmail);

        LinkedHashMap<String, String> properties = dto.properties();
        String newName = properties.get("Name");
        newName = this.validationService.updateName(dto.id(), newName, userEmail);
        properties.replace("Name", newName);

        String oldName =  tempRepository.findById(dto.id()).toString();

        if (!oldName.equals(newName)){
            this.updateMaterialNameInsideConstructions(userEmail, oldName, newName);
        }

        TempDocument tempDocument = TempDocument.builder()
                .id(dto.id())
                .name(newName)
                .userEmail(userEmail)
                .type(dto.type())
                .properties(properties)
                .build();

        this.tempRepository.save(tempDocument);
    }

    private void updateMaterialNameInsideConstructions(
            String userEmail,
            String oldMaterialName,
            String newMaterialName
    ) {
        List<String> layerKeys = List.of(
                "Outside_Layer",
                "Layer_2",
                "Layer_3",
                "Layer_4",
                "Layer_5",
                "Layer_6",
                "Layer_7",
                "Layer_8",
                "Layer_9",
                "Layer_10"
        );

        List<TempDocument> constructions = this.tempRepository
                .findAllByUserEmailAndType(userEmail, "CONSTRUCTION");

        List<TempDocument> updatedConstructions = constructions.stream()
                .filter(construction ->
                        constructionContainsMaterial(
                                construction,
                                layerKeys,
                                oldMaterialName
                        )
                )
                .map(construction ->
                        replaceMaterialNameInConstruction(
                                construction,
                                layerKeys,
                                oldMaterialName,
                                newMaterialName
                        )
                )
                .toList();

        this.tempRepository.saveAll(updatedConstructions);
    }

    private boolean constructionContainsMaterial(
            TempDocument constructionDocument,
            List<String> layerKeys,
            String oldMaterialName
    ) {
        return layerKeys.stream()
                .map(layerKey -> constructionDocument.getProperties().get(layerKey))
                .filter(Objects::nonNull)
                .map(Object::toString)
                .filter(materialName -> !materialName.isBlank())
                .anyMatch(materialName -> materialName.equals(oldMaterialName));
    }

    private TempDocument replaceMaterialNameInConstruction(
            TempDocument constructionDocument,
            List<String> layerKeys,
            String oldMaterialName,
            String newMaterialName
    ) {
        LinkedHashMap<String, String> properties =
                constructionDocument.getProperties();

        for (String layerKey : layerKeys) {
            String currentMaterialName = properties.get(layerKey);

            if (oldMaterialName.equals(currentMaterialName)) {
                properties.put(layerKey, newMaterialName);
            }
        }

        constructionDocument.setProperties(properties);

        return constructionDocument;
    }


}
