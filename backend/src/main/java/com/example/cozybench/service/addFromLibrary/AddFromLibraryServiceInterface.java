package com.example.cozybench.service.addFromLibrary;

import com.example.cozybench.model.TypeEnumInterface;

public interface AddFromLibraryServiceInterface {
    boolean supports(TypeEnumInterface type);
    void addFromLibrary(String id, String userEmail);
}
