package com.example.cozybench.dto.constructionsDTO.responsePart;

import lombok.Builder;

@Builder
public record ResponseComponentDescriptorDTO(
        String id,
        String type,
        String name
) implements ResponseDescriptorDTO {}
