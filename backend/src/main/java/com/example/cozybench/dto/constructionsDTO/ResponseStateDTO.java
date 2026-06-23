package com.example.cozybench.dto.constructionsDTO;

import com.example.cozybench.dto.constructionsDTO.ResponseAggregator.ResponseComponentDTO;
import com.example.cozybench.dto.constructionsDTO.ResponseAggregator.ResponseComponentListDTO;
import com.example.cozybench.dto.constructionsDTO.responsePart.ResponseComponentDescriptorDTO;
import lombok.Builder;

@Builder
public record ResponseStateDTO(
        ResponseComponentListDTO<ResponseComponentDescriptorDTO> componentDescriptions,
        ResponseComponentDTO component,
        ResponseComponentListDTO<ResponseComponentDescriptorDTO> libraryDescriptions,
        ResponseComponentListDTO<ResponseComponentDescriptorDTO> selectableComponentDescriptions
) implements ResponseDTO {}
