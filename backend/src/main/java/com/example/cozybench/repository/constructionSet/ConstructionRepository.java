package com.example.cozybench.repository.constructionSet;

import com.example.cozybench.document.ConstructionDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ConstructionRepository extends MongoRepository<ConstructionDocument, String> {

    Optional<ConstructionDocument> findByName(String name);

    List<ConstructionDocument> findByNameIn(List<String> names);

}
