package com.cozybench.building.model.document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;

import java.util.LinkedHashMap;

/** Mongo fields shared by a library definition and its user-owned workspace copy. */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public abstract class BaseComponentDocument {

    @Id
    private String id;

    @NotBlank
    private String name;

    @NotNull
    // Keep IDD order stable for editor rendering and EnergyPlus serialization.
    private LinkedHashMap<String, String> properties;
}
