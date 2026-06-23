package com.example.cozybench.service.update;

import com.example.cozybench.document.TempDocument;
import com.example.cozybench.dto.constructionsDTO.ResponseAggregator.ResponseComponentDTO;
import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.ConstructionSetTypeEnum;
import com.example.cozybench.model.enums.ConstructionTypeEnum;
import com.example.cozybench.repository.constructionSet.TempRepository;
import com.example.cozybench.service.constructionSet.ValidationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;

@Service
@RequiredArgsConstructor
public class ConstructionSetUpdateService implements UpdateServiceInterface {
    private final ValidationService validationService;
    private final TempRepository tempRepository;

    @Override
    public boolean supports(TypeEnumInterface type) {
        return type instanceof ConstructionSetTypeEnum;
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



        TempDocument tempDocument = TempDocument.builder()
                .id(dto.id())
                .name(newName)
                .userEmail(userEmail)
                .type(dto.type())
                .properties(properties)
                .build();

        this.tempRepository.save(tempDocument);
    }
}
