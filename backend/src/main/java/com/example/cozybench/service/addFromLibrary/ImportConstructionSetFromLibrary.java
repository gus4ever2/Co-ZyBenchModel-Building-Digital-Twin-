package com.example.cozybench.service.addFromLibrary;

import com.example.cozybench.document.TempDocument;
import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.ConstructionSetTypeEnum;
import com.example.cozybench.model.enums.ConstructionTypeEnum;
import com.example.cozybench.repository.constructionSet.TempRepository;
import com.example.cozybench.service.constructionSet.ValidationService;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ImportConstructionSetFromLibrary extends ImportComponentFromLibrary implements AddFromLibraryServiceInterface {
    private static final List<String> LAYER_KEYS = List.of(
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
    private static final List<String> CONSTRUCTION_KEYS = List.of(
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

    public ImportConstructionSetFromLibrary(TempRepository tempRepository,
                                            MongoTemplate mongoTemplate,
                                            ValidationService validationService
    ) {
        super(validationService, tempRepository, mongoTemplate);
    }

    @Override
    public boolean supports(TypeEnumInterface type) {
        return type instanceof ConstructionSetTypeEnum;
    }

    @Override
    public void addFromLibrary(String id, String userEmail) {

        TempDocument tempDocument = super.addFromLibrary("constructionSet", id, userEmail);

        // Here appends every construction so then the materials will be imported

        List<TempDocument> addedDocuments = super.importTheNecessaryComponents(
                CONSTRUCTION_KEYS,
                tempDocument,
                "construction",
                userEmail
        );

        addedDocuments.forEach(
                tempDocumentToAdd -> {
                    super.importTheNecessaryComponents(
                            LAYER_KEYS,
                            tempDocumentToAdd,
                            "material",
                            userEmail
                    );
                }
        );

        this.tempRepository.save(tempDocument);
    }
}