package com.cozybench.config.library;

import org.bson.Document;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/** Registers materials. They are terminal objects and have no library references. */
@Component
@Order(10)
final class MaterialLibrarySeedImporter extends AbstractLibrarySeedImporter {

    MaterialLibrarySeedImporter() {
        super("material", "data/library/material.json", "MATERIAL");
    }

    @Override
    public void resolveReferences(LibrarySeedAssembly assembly) {
        // Material properties do not point to other building-library objects.
    }
}
