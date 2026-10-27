package com.cozybench.config.library;

import com.cozybench.building.idfobject.construction.ConstructionLayerProperty;
import com.cozybench.building.idfobject.construction.InternalHeatSourceProperty;
import org.bson.Document;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Set;

/** Resolves material layers and internal-heat-source parent constructions. */
@Component
@Order(20)
final class ConstructionLibrarySeedImporter extends AbstractLibrarySeedImporter {

    ConstructionLibrarySeedImporter() {
        super("construction", "data/library/construction.json", "CONSTRUCTION");
    }

    @Override
    public void resolveReferences(LibrarySeedAssembly assembly) {
        for (Document object : assembly.objectsFor(seedName())) {
            Document properties = object.get("properties", Document.class);
            String type = object.getString("type");
            if ("CONSTRUCTION".equalsIgnoreCase(type)) {
                assembly.replaceReferences(
                        object, properties,
                        java.util.Arrays.stream(ConstructionLayerProperty.values())
                                .map(ConstructionLayerProperty::fieldName).collect(java.util.stream.Collectors.toSet()),
                        "material"
                );
            } else if ("CONSTRUCTIONPROPERTY:INTERNALHEATSOURCE".equalsIgnoreCase(type)) {
                assembly.replaceReferences(object, properties,
                        Set.of(InternalHeatSourceProperty.CONSTRUCTION_NAME.fieldName()), seedName());
            }
        }
    }
}
