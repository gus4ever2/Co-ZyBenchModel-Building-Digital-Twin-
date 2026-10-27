package com.cozybench.config.library;

import org.bson.Document;

import java.util.List;

/**
 * Imports one family of bundled building-library objects into an in-memory
 * seed assembly. Implementations define their own reference rules.
 */
interface LibrarySeedImporter {

    String seedName();

    String resourcePath();

    void register(List<Document> sourceObjects, LibrarySeedAssembly assembly);

    void resolveReferences(LibrarySeedAssembly assembly);
}
