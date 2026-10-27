package com.cozybench.building.service.workspace;

import java.util.List;

/** Polymorphic input for deleting one workspace document or a batch of documents. */
public sealed interface WorkspaceDeletion permits WorkspaceDeletion.Single, WorkspaceDeletion.Multiple {

    List<String> documentIds();

    static WorkspaceDeletion single(String documentId) {
        return new Single(documentId);
    }

    static WorkspaceDeletion multiple(List<String> documentIds) {
        return new Multiple(documentIds);
    }

    record Single(String documentId) implements WorkspaceDeletion {
        public Single {
            if (documentId == null || documentId.isBlank()) {
                throw new IllegalArgumentException("Workspace document ID is required");
            }
        }

        @Override
        public List<String> documentIds() {
            return List.of(documentId);
        }
    }

    record Multiple(List<String> documentIds) implements WorkspaceDeletion {
        public Multiple {
            if (documentIds == null || documentIds.isEmpty()
                    || documentIds.stream().anyMatch(id -> id == null || id.isBlank())) {
                throw new IllegalArgumentException("At least one valid workspace document ID is required");
            }
            documentIds = documentIds.stream().distinct().toList();
        }
    }
}
