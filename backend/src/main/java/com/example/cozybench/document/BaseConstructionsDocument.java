package com.example.cozybench.document;

import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;

import java.util.LinkedHashMap;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@CompoundIndex(
        name = "userEmail_name_unique",
        def = "{'userEmail': 1, 'name': 1}",
        unique = true
)
public abstract class BaseConstructionsDocument {

    @Id
    private String id;

    @NonNull
    private String name;

    @NonNull
    private String type;

    @NonNull
    private LinkedHashMap<String, String> properties;
}
