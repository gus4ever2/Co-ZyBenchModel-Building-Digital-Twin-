package com.example.cozybench.dto.constructionsDTO.responsePart;

public record ResponseComponentPropertyDTO(
        String name,
        String value
) implements ResponseDescriptorDTO {}

