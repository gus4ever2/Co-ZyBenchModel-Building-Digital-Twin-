package com.example.cozybench.repository.constructionSet;

import com.example.cozybench.document.ConstructionSetDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ConstructionSetRepository extends MongoRepository<ConstructionSetDocument, String> {

    Optional<ConstructionSetDocument> findByName(String name);


}
