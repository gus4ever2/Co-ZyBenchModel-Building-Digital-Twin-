package com.cozybench.building.model.document;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/** A material, construction, or construction set in the shared library. */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@Document(collection = "buildingLibraryObjects")
public class BuildingLibraryObjectDocument extends BaseComponentDocument {

    /** EnergyPlus IDD object name retained by the shared library document. */
    private String type;

    private String nameKey;

    @Indexed
    private String category;
}
