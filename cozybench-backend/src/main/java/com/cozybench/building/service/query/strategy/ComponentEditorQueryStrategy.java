package com.cozybench.building.service.query.strategy;

import com.cozybench.building.dto.ComponentStateResponse;
import com.cozybench.building.model.type.ComponentCategory;

/** Read strategy for one Building DT editor. */
public interface ComponentEditorQueryStrategy {
    ComponentCategory editorCategory();
    ComponentStateResponse load(String ownerId, String selectedId);
}
