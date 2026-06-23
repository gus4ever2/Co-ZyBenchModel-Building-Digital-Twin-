package com.example.cozybench.repository.constructionSet;

import com.example.cozybench.document.MaterialDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface MaterialRepository extends MongoRepository<MaterialDocument, String> {

    Optional<MaterialDocument> findByName(String name);

    List<MaterialDocument> findByNameIn(List<String> names);
}