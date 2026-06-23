package com.example.cozybench.service.update;

import com.example.cozybench.model.TypeEnumInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@RequiredArgsConstructor
public class UpdateResolver {

    private final List<UpdateServiceInterface> updateServices;

    public UpdateServiceInterface resolve(TypeEnumInterface type) {
        return updateServices.stream()
                .filter(service -> service.supports(type))
                .findFirst()
                .orElseThrow(() ->
                        new IllegalArgumentException("No update service found for type: " + type)
                );
    }
}
