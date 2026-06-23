package com.example.cozybench.document;

import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Document(collection = "temp")
public class TempDocument extends BaseConstructionsDocument {

    @NonNull
    private String userEmail;
}