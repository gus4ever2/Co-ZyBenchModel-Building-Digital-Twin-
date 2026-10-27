package com.cozybench.building.service.workspace;

/** Supplies source metadata for a record written to a user's workspace. */
public sealed interface WorkspaceImportOrigin
        permits WorkspaceImportOrigin.Created, WorkspaceImportOrigin.Duplicated,
        WorkspaceImportOrigin.LibraryCopy {

    String sourceLibraryId();

    Boolean modified();

    /** A new editor draft has no library source and starts as user-owned data. */
    record Created() implements WorkspaceImportOrigin {
        @Override
        public String sourceLibraryId() {
            return null;
        }

        @Override
        public Boolean modified() {
            return true;
        }
    }

    /** A duplicate is a new independent workspace object, not a library copy. */
    record Duplicated() implements WorkspaceImportOrigin {
        @Override
        public String sourceLibraryId() {
            return null;
        }

        @Override
        public Boolean modified() {
            return null;
        }
    }

    /** An untouched library copy retains its source ID so later imports can reuse it. */
    record LibraryCopy(String sourceLibraryId) implements WorkspaceImportOrigin {
        public LibraryCopy {
            if (sourceLibraryId == null || sourceLibraryId.isBlank()) {
                throw new IllegalArgumentException("Library source ID is required");
            }
        }

        @Override
        public Boolean modified() {
            return false;
        }
    }
}
