package com.example.cozybench.service.update;

import com.example.cozybench.document.TempDocument;
import com.example.cozybench.dto.constructionsDTO.ResponseAggregator.ResponseComponentDTO;
import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.ConstructionTypeEnum;
import com.example.cozybench.repository.constructionSet.TempRepository;
import com.example.cozybench.service.constructionSet.ValidationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ConstructionUpdateService implements UpdateServiceInterface {
    private final ValidationService validationService;
    private final TempRepository tempRepository;

    @Override
    public boolean supports(TypeEnumInterface type) {
        return type instanceof ConstructionTypeEnum;
    }

    @Override
    public void update(ResponseComponentDTO dto, String userEmail) {

        this.validationService.validate(dto, userEmail);

        LinkedHashMap<String, String> properties = dto.properties();
        String newName = properties.get("Name");
        newName = this.validationService.updateName(dto.id(), newName, userEmail);
        properties.replace("Name", newName);

        // find old name
        TempDocument currentDocument = tempRepository.findById(dto.id())
                .orElseThrow(() ->
                        new IllegalArgumentException("Component not found with id: " + dto.id())
                );

        String oldName = currentDocument.getName().toString();
        System.out.println(oldName);

        if (!oldName.equals(newName)){
            this.updateConstructionNameInsideConstructionSets(userEmail, oldName, newName);
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

    private void updateConstructionNameInsideConstructionSets(
            String userEmail,
            String oldConstructionName,
            String newConstructionName
    ) {
        List<String> constructionSetKeys = List.of(
                "exteriorWall",
                "exteriorFloor",
                "exteriorRoof",

                "interiorWall",
                "interiorFloor",
                "interiorCeiling",

                "groundContactWall",
                "groundContactFloor",
                "groundContactCeiling",

                "exteriorFixedWindow",
                "exteriorOperableWindow",
                "exteriorDoor",
                "exteriorGlassDoor",
                "exteriorOverheadDoor",
                "exteriorSkylight",
                "exteriorTubularDaylightDome",
                "exteriorTubularDaylightDiffuser",

                "interiorFixedWindow",
                "interiorOperableWindow",
                "interiorDoor",

                "spaceShading",
                "buildingShading",
                "siteShading",
                "interiorPartition",
                "adiabaticSurface"
        );


        List<TempDocument> constructionSets = this.tempRepository
                .findAllByUserEmailAndType(userEmail, "construction_set");



        List<TempDocument> updatedConstructionSets = constructionSets.stream()
                .filter(constructionSet ->
                        constructionSetContainsConstruction(
                                constructionSet,
                                constructionSetKeys,
                                oldConstructionName
                        )
                )
                .map(constructionSet ->
                        replaceConstructionNameInConstructionSet(
                                constructionSet,
                                constructionSetKeys,
                                oldConstructionName,
                                newConstructionName
                        )
                )
                .toList();

        this.tempRepository.saveAll(updatedConstructionSets);
    }

    private boolean constructionSetContainsConstruction(
            TempDocument constructionSetDocument,
            List<String> constructionSetKeys,
            String oldConstructionName
    ) {
        return constructionSetKeys.stream()
                .map(key -> constructionSetDocument.getProperties().get(key))
                .filter(Objects::nonNull)
                .map(Object::toString)
                .filter(constructionName -> !constructionName.isBlank())
                .anyMatch(constructionName -> constructionName.equals(oldConstructionName));
    }

    private TempDocument replaceConstructionNameInConstructionSet(
            TempDocument constructionSetDocument,
            List<String> constructionSetKeys,
            String oldConstructionName,
            String newConstructionName
    ) {
        LinkedHashMap<String, String> properties =
                constructionSetDocument.getProperties();

        for (String key : constructionSetKeys) {
            String currentConstructionName = properties.get(key);

            if (oldConstructionName.equals(currentConstructionName)) {
                properties.put(key, newConstructionName);
            }
        }

        constructionSetDocument.setProperties(properties);

        return constructionSetDocument;
    }
}
