package com.cozybench.building.repository;

import com.cozybench.building.model.document.WorkspaceComponentDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/** Owner-scoped Mongo queries used by workspace editing and dependency handling. */
public interface WorkspaceComponentRepository
        extends MongoRepository<WorkspaceComponentDocument, String> {

    /** Returns one user's editor objects in display-name order. */
    List<WorkspaceComponentDocument> findAllByOwnerIdOrderByNameAsc(String ownerId);

    /** Loads only the requested stored type names for one user's editor or reference lists. */
    List<WorkspaceComponentDocument> findAllByOwnerIdAndTypeInOrderByNameAsc(
            String ownerId,
            Collection<String> types
    );

    /** Never resolves a workspace ID without also checking its owner. */
    Optional<WorkspaceComponentDocument> findByIdAndOwnerId(String id, String ownerId);

    /** Looks up a name after the name service has normalized it for case-insensitive comparison. */
    Optional<WorkspaceComponentDocument> findByOwnerIdAndNameKey(
            String ownerId,
            String nameKey
    );

    /**
     * Finds the untouched workspace copy created from one library object.
     * Modified copies deliberately do not participate: importing the library
     * object again must then produce a fresh, independent copy.
     */
    Optional<WorkspaceComponentDocument> findByOwnerIdAndSourceLibraryIdAndModifiedFalse(
            String ownerId,
            String sourceLibraryId
    );
}
