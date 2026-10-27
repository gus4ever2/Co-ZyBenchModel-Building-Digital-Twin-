package com.cozybench.config.library;

import org.bson.Document;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/** Resolves every populated construction-set field to a construction library ID. */
@Component
@Order(30)
final class ConstructionSetLibrarySeedImporter extends AbstractLibrarySeedImporter {

    ConstructionSetLibrarySeedImporter() {
        super("constructionSet", "data/library/constructionSet.json", "CONSTRUCTION_SET");
    }

    @Override
    public void resolveReferences(LibrarySeedAssembly assembly) {
        for (Document object : assembly.objectsFor(seedName())) {
            Document properties = object.get("properties", Document.class);
            assembly.replaceReferences(object, properties, properties.keySet(), "construction");
        }
    }
}
