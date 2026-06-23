package com.example.cozybench.controller.constructionSet;

import com.example.cozybench.dto.constructionsDTO.ResponseAggregator.ResponseComponentDTO;
import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.enums.TypeEnumClassResolver;
import com.example.cozybench.service.addFromLibrary.LibraryAddResolver;
import com.example.cozybench.service.constructionSet.CRUDService;
import com.example.cozybench.service.update.UpdateResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping(value="/constructions", produces="application/json")
public class CRUDController {
    private final CRUDService _CRUDService;
    private final TypeEnumClassResolver typeEnumClassResolver;
    private final UpdateResolver updateResolver;
    private final LibraryAddResolver libraryAddResolver;

    @PostMapping("/create")
    public void create(Authentication authentication, @RequestParam String type) {
        this._CRUDService.create(authentication.getName(), type);
    }

    @PutMapping("/update")
    public void update(Authentication authentication, @RequestParam String className, @RequestParam String type, @RequestBody ResponseComponentDTO dto) {
        TypeEnumInterface enumValue = typeEnumClassResolver.resolve(className, type);
        this.updateResolver.resolve(enumValue).update(dto, authentication.getName());
    }

    @PostMapping("/duplicate")
    public void duplicate(Authentication authentication, @RequestParam String id, @RequestParam String type) {
        this._CRUDService.duplicate(authentication.getName(), id, type);
    }

    @PostMapping("/add")
    public void add(Authentication authentication, @RequestParam String className, @RequestParam String type, @RequestParam String id) {
        //this._CRUDService.add(authentication.getName(), id, type);
        TypeEnumInterface enumValue = typeEnumClassResolver.resolve(className, type);
        this.libraryAddResolver.resolve(enumValue).addFromLibrary(id, authentication.getName());
    }

    @DeleteMapping("/delete")
    public void delete(Authentication authentication, @RequestParam String id) {
        this._CRUDService.delete(authentication.getName(), id);
    }
}
