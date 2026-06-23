package com.example.cozybench.service.update;

import com.example.cozybench.document.TempDocument;
import com.example.cozybench.dto.constructionsDTO.ResponseAggregator.ResponseComponentDTO;
import com.example.cozybench.model.TypeEnumInterface;

public interface UpdateServiceInterface {

    boolean supports(TypeEnumInterface type);

    void update(ResponseComponentDTO dto, String userEmail);
}
