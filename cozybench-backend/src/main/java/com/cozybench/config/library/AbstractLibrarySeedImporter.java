package com.cozybench.config.library;

import org.bson.Document;

import java.util.List;

/** Common registration step shared by all bundled-library object families. */
abstract class AbstractLibrarySeedImporter implements LibrarySeedImporter {

    private final String seedName;
    private final String resourcePath;
    private final String category;

    protected AbstractLibrarySeedImporter(String seedName, String resourcePath, String category) {
        this.seedName = seedName;
        this.resourcePath = resourcePath;
        this.category = category;
    }

    @Override
    public final String seedName() {
        return seedName;
    }

    @Override
    public final String resourcePath() {
        return resourcePath;
    }

    @Override
    public final void register(List<Document> sourceObjects, LibrarySeedAssembly assembly) {
        assembly.register(seedName, category, sourceObjects);
    }
}
