package com.example.cozybench.document;

import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
@Document(collection = "construction")
public class ConstructionDocument extends BaseConstructionsDocument {}
