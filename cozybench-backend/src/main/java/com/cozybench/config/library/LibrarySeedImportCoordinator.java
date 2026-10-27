package com.cozybench.config.library;

import org.bson.Document;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Coordinates the independently extensible seed importers.
 *
 * Adding a new library-object family requires one importer only: it declares
 * its JSON resource and reference rules without changing MongoDB setup code.
 */
@Component
public class LibrarySeedImportCoordinator {

    private final List<LibrarySeedImporter> importers;

    public LibrarySeedImportCoordinator(List<LibrarySeedImporter> importers) {
        this.importers = importers;
    }

    public List<Document> prepareLibrary() {
        Map<String, List<Document>> sourceObjects = new LinkedHashMap<>();
        for (LibrarySeedImporter importer : importers) {
            sourceObjects.put(importer.seedName(), readDocuments(importer.resourcePath()));
        }
        return prepare(sourceObjects);
    }

    List<Document> prepare(Map<String, List<Document>> sourceObjects) {
        LibrarySeedAssembly assembly = new LibrarySeedAssembly();
        for (LibrarySeedImporter importer : importers) {
            List<Document> objects = sourceObjects.get(importer.seedName());
            if (objects == null) {
                throw new IllegalArgumentException("Missing seed input: " + importer.seedName());
            }
            importer.register(objects, assembly);
        }
        for (LibrarySeedImporter importer : importers) {
            importer.resolveReferences(assembly);
        }
        return assembly.result();
    }

    private List<Document> readDocuments(String resourcePath) {
        ClassPathResource resource = new ClassPathResource(resourcePath);
        try (InputStream input = resource.getInputStream()) {
            String json = new String(input.readAllBytes(), StandardCharsets.UTF_8);
            return Document.parse("{\"items\":" + json + "}").getList("items", Document.class);
        } catch (IOException exception) {
            throw new IllegalStateException("Could not read library seed file: " + resourcePath, exception);
        }
    }
}
