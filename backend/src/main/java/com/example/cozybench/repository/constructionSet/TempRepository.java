package com.example.cozybench.repository.constructionSet;

import com.example.cozybench.document.TempDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface TempRepository extends MongoRepository<TempDocument, String> {

    void deleteByUserEmail(String userEmail);

    List<TempDocument> findAllByUserEmailAndTypeIn(
            String userEmail,
            Set<String> types
    );

    List<TempDocument> findAllByUserEmailAndType(
            String userEmail,
            String type
    );

    List<TempDocument> findAllByUserEmail(String userEmail);

    void deleteByIdAndUserEmail(String id, String userEmail);

    Optional<TempDocument> findByIdAndUserEmail(String id, String userEmail);

    Optional<TempDocument> findByName(String name);

    Optional<TempDocument> findByUserEmailAndId(String userEmail, String id);

    Optional<TempDocument> findAllByUserEmailAndName(String userEmail, String name);
}
