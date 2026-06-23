package com.example.cozybench.service.addFromLibrary;

import com.example.cozybench.document.TempDocument;
import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.ConstructionTypeEnum;
import com.example.cozybench.repository.constructionSet.TempRepository;
import com.example.cozybench.service.constructionSet.ValidationService;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class ConstructionLibraryImportService extends ImportComponentFromLibrary implements AddFromLibraryServiceInterface {
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

    public ConstructionLibraryImportService(TempRepository tempRepository,
                                            MongoTemplate mongoTemplate,
                                            ValidationService validationService
    ) {
        super(validationService, tempRepository, mongoTemplate);
    }

    @Override
    public boolean supports(TypeEnumInterface type) {
        return type instanceof ConstructionTypeEnum;
    }

    @Override
    public void addFromLibrary(String id, String userEmail) {

        TempDocument tempDocument = super.addFromLibrary("construction", id, userEmail);

        this.importTheNecessaryComponents(
                LAYER_KEYS,
                tempDocument,
                "material",
                userEmail
        );

        LinkedHashMap<String, String> properties = tempDocument.getProperties();
        LinkedHashMap<String, String> filteredProperties = super.deleteBlackFromProperties(properties);
        tempDocument.setProperties(filteredProperties);

        // Save the validated Construction
        this.tempRepository.save(tempDocument);
    }
}


