package com.example.cozybench.service.addFromLibrary;

import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.ConstructionTypeEnum;
import com.example.cozybench.repository.constructionSet.TempRepository;
import com.example.cozybench.service.constructionSet.ValidationService;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;


@Service
public class ImportMaterialFromLibrary extends ImportComponentFromLibrary implements AddFromLibraryServiceInterface {

    public ImportMaterialFromLibrary(ValidationService validationService, TempRepository tempRepository, MongoTemplate mongoTemplate) {
        super(validationService, tempRepository, mongoTemplate);
    }

    @Override
    public boolean supports(TypeEnumInterface type) {
        return type instanceof ConstructionTypeEnum;
    }

    @Override
    public void addFromLibrary(String id, String userEmail) {
        super.addFromLibrary("material", id, userEmail);
    }
}
