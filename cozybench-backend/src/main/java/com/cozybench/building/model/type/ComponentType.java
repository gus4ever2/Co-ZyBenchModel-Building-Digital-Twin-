package com.cozybench.building.model.type;

/** Common identity for a component type: its API enum name, IDD name, and editor category. */
public interface ComponentType {

    String eppyName();

    /** Category determines which factory and editor behavior handles this type. */
    ComponentCategory category();

    /** Stable Java/API identifier used in requests and responses. */
    default String apiName() {
        return ((Enum<?>) this).name();
    }
}
