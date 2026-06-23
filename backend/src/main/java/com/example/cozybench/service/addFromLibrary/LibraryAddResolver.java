package com.example.cozybench.service.addFromLibrary;

import com.example.cozybench.model.TypeEnumInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class LibraryAddResolver {

    private final List<AddFromLibraryServiceInterface> services;

    public AddFromLibraryServiceInterface resolve(TypeEnumInterface type) {
        return services.stream()
                .filter(service -> service.supports(type))
                .findFirst()
                .orElseThrow(() ->
                        new IllegalArgumentException("No add service found for type: " + type)
                );
    }
}