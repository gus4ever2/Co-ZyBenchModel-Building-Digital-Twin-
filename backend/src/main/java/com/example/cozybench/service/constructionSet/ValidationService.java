package com.example.cozybench.service.constructionSet;

import com.example.cozybench.document.TempDocument;
import com.example.cozybench.dto.constructionsDTO.ResponseAggregator.ResponseComponentDTO;
import com.example.cozybench.model.factory.FactoryInterface;
import com.example.cozybench.model.factory.MaterialRecordFactory;
import com.example.cozybench.model.factory.RegistryResolver;
import com.example.cozybench.repository.constructionSet.TempRepository;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ValidationService {

    private final Validator validator;
    private final MaterialRecordFactory materialRecordFactory;
    private final TempRepository tempRepository;
    private final RegistryResolver registryResolver;

    public boolean validate(ResponseComponentDTO dto, String userEmail) {

        FactoryInterface<?> factory = registryResolver.getFactory(dto.type());
        Object record = factory.createFromProperties(dto.properties());

        Set<ConstraintViolation<Object>> violations = validator.validate(record);

        if (!violations.isEmpty()) {
            String message = violations.stream()
                    .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                    .collect(Collectors.joining(", "));

            throw new RuntimeException(message);
        }
        return true;
    }

    public String findOldName(String id) {
        Optional<TempDocument> tempDocument = tempRepository.findById(id);

        if (tempDocument.isPresent()) {
            return tempDocument.get().getName();
        }

        throw new IllegalArgumentException("TempDocument not found with id: " + id);
    }

    public String updateName(String newName, String userEmail) {
        return updateName(null, newName, userEmail);
    }

    public String updateName(String id, String newName, String userEmail) {
        Set<String> names = this.getComponentsNames(userEmail);

        if (id != null) {
            TempDocument currentDocument = tempRepository.findById(id)
                    .orElseThrow(() ->
                            new IllegalArgumentException("Component not found with id: " + id)
                    );

            names.remove(currentDocument.getName());
        }

        return findValidName(newName, names);
    }

    private Set<String> getComponentsNames(String userEmail) {
        return tempRepository.findAllByUserEmail(userEmail)
                .stream()
                .map(TempDocument::getName)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    }

    private String findValidName(String newName, Set<String> names){
        int i = 1;
        String validName = newName;
        while (isExist(validName, (HashSet<String>) names)){
            validName = newName + " (" + i + ")";
            i++;
        }
        return validName;
    }

    private boolean isExist(String name, HashSet<String> names){
        return (names).contains(name);
    }
}
