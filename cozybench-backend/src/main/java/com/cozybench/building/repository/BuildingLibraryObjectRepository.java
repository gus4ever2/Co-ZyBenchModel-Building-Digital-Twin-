package com.cozybench.building.repository;

import com.cozybench.building.model.document.BuildingLibraryObjectDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

/** Mongo queries for the shared component library, separate from each user's workspace. */
public interface BuildingLibraryObjectRepository extends MongoRepository<BuildingLibraryObjectDocument, String> {
    Optional<BuildingLibraryObjectDocument> findByNameKey(String nameKey);

    List<BuildingLibraryObjectDocument> findByCategoryOrderByNameAsc(String category);
}
