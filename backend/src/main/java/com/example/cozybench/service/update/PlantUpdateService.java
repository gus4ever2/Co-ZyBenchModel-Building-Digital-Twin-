package com.example.cozybench.service.update;

import com.example.cozybench.document.TempDocument;
import com.example.cozybench.dto.constructionsDTO.ResponseAggregator.ResponseComponentDTO;
import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.PlantEnum;
import com.example.cozybench.repository.constructionSet.TempRepository;
import com.example.cozybench.service.PlantService;
import com.example.cozybench.service.constructionSet.ValidationService;
import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;

@Service
@RequiredArgsConstructor
public class PlantUpdateService implements UpdateServiceInterface {

    private final ValidationService validationService;
    private final TempRepository tempRepository;
    private final PlantService plantService;

    @Override
    public boolean supports(TypeEnumInterface type) {
        return type instanceof PlantEnum;
    }

    @Override
    public void update(ResponseComponentDTO dto, String userEmail) {

        this.validationService.validate(dto, userEmail);

        LinkedHashMap<String, String> properties = dto.properties();

        String newName = properties.get("Name");

        newName = this.validationService.updateName(
                dto.id(),
                newName,
                userEmail
        );

        properties.replace("Name", newName);

        TempDocument tempDocument = TempDocument.builder()
                .id(dto.id())
                .name(newName)
                .userEmail(userEmail)
                .type(dto.type())
                .properties(properties)
                .build();

        TempDocument doc = this.tempRepository.save(tempDocument);

    }
}