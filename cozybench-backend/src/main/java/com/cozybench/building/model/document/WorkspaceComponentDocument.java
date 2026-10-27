package com.cozybench.building.model.document;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

/** User-owned component; its property references point to workspace document IDs. */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@Document(collection = "workspaceComponent")
@CompoundIndex(
        name = "owner_name_unique",
        def = "{'ownerId': 1, 'nameKey': 1}",
        unique = true
)
@CompoundIndex(
        name = "owner_library_copy_lookup",
        def = "{'ownerId': 1, 'sourceLibraryId': 1, 'modified': 1}"
)
public class WorkspaceComponentDocument extends BaseComponentDocument {

    @NotBlank
    private String ownerId;

    @NotBlank
    private String nameKey;

    /** Structured path fields keep type selection explicit in workspace documents. */
    @NotBlank
    private String domain;

    @NotBlank
    private String category;

    /** Stable API enum identifier, distinct from the EnergyPlus IDD object name. */
    @NotBlank
    private String type;

    /** Exact IDD object name used when generating simulation input. */
    @NotBlank
    private String epiName;

    // User-created and duplicated objects have no library source.
    private String sourceLibraryId;
    // False means an untouched library copy can be reused during a later import.
    private Boolean modified;
}
