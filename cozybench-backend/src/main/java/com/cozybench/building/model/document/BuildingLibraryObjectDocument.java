package com.cozybench.building.model.document;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

/** A material, construction, or construction set in the shared library. */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@Document(collection = "buildingLibraryObjects")
public class BuildingLibraryObjectDocument extends BaseComponentDocument {

    /** Stable API type key; EnergyPlus names are resolved from the enum registry. */
    private String type;

    private String nameKey;

    /** Legacy category is derived from type and never persisted in new documents. */
    @Transient
    private String category;
}
