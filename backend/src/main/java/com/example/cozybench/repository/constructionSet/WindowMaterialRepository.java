package com.example.cozybench.repository.constructionSet;

import com.example.cozybench.document.WindowMaterialDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface WindowMaterialRepository extends MongoRepository<WindowMaterialDocument, String> {

    Optional<WindowMaterialDocument> findByName(String name);

    List<WindowMaterialDocument> findByNameIn(List<String> names);
}