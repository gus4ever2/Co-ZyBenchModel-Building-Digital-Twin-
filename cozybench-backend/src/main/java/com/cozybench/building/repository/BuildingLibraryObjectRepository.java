package com.cozybench.building.repository;

import com.cozybench.building.model.document.BuildingLibraryObjectDocument;
import com.cozybench.building.model.type.ComponentTypeRegistry;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

/** Mongo queries for the shared component library, separate from each user's workspace. */
public interface BuildingLibraryObjectRepository extends MongoRepository<BuildingLibraryObjectDocument, String> {
    Optional<BuildingLibraryObjectDocument> findByNameKey(String nameKey);

    /** Legacy test/maintenance view; production queries derive category from canonical type. */
    default List<BuildingLibraryObjectDocument> findByCategoryOrderByNameAsc(String category) {
        var registry = new ComponentTypeRegistry();
        return findAll().stream()
                .filter(item -> item.getCategory() != null
                        ? category.equals(item.getCategory())
                        : category.equals(registry.resolve(item.getType()).category().name()))
                .sorted(java.util.Comparator.comparing(BuildingLibraryObjectDocument::getName,
                        String.CASE_INSENSITIVE_ORDER))
                .toList();
    }
}
