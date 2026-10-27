package com.cozybench.building.model.type;

import java.util.Arrays;

/** Stable library keys and their user-facing names for predefined sets. */
public enum PredefinedConstructionSetName {
    CZ1("189_1_2009_CZ1_Office", "ASHRAE 189.1 (2009) · Office · Climate zone 1"),
    CZ2("189_1_2009_CZ2_Office", "ASHRAE 189.1 (2009) · Office · Climate zone 2"),
    CZ3("189_1_2009_CZ3_Office", "ASHRAE 189.1 (2009) · Office · Climate zone 3"),
    CZ4("189_1_2009_CZ4_Office", "ASHRAE 189.1 (2009) · Office · Climate zone 4"),
    CZ5("189_1_2009_CZ5_Office", "ASHRAE 189.1 (2009) · Office · Climate zone 5"),
    CZ6("189_1_2009_CZ6_Office", "ASHRAE 189.1 (2009) · Office · Climate zone 6"),
    CZ7_8("189_1_2009_CZ7_8_Office", "ASHRAE 189.1 (2009) · Office · Climate zone 7-8");

    private final String libraryName;
    private final String displayName;

    PredefinedConstructionSetName(String libraryName, String displayName) {
        this.libraryName = libraryName;
        this.displayName = displayName;
    }

    /** Shows a readable climate-zone label while preserving unknown library names unchanged. */
    public static String displayNameFor(String libraryName) {
        return Arrays.stream(values())
                .filter(value -> value.libraryName.equalsIgnoreCase(libraryName))
                .map(value -> value.displayName)
                .findFirst()
                .orElse(libraryName);
    }
}
