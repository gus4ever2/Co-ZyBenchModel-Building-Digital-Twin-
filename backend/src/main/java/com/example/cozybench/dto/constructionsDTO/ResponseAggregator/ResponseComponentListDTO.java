package com.example.cozybench.dto.constructionsDTO.ResponseAggregator;

import com.example.cozybench.dto.constructionsDTO.responsePart.ResponseDescriptorDTO;

import java.util.List;

public record ResponseComponentListDTO<D extends ResponseDescriptorDTO> (
        List<D> componentParts
) implements ResponseAggregatorDTO {}
