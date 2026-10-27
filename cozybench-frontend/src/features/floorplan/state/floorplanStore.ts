import { createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import type {
  BackgroundImage,
  EditorTool,
  Fenestration,
  FloorplanProject,
  PhysicalWall,
  Point2D,
  Selection,
  Space,
  ThermalZone,
} from "../domain/types";
import {
  FLOORPLAN_GRID_SPACINGS,
  THERMAL_ZONE_PALETTE,
  isDoor,
} from "../domain/types";
import {
  attachFenestrations,
  buildPhysicalWalls,
  snapPoint,
  validateFenestration,
} from "../geometry/floorplanGeometry";

const STORAGE_KEY = "cozybench.floorplan.v1";
const DEFAULT_STORY_ID = "story-ground";

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function initialProject(): FloorplanProject {
  return {
    stories: [{ id: DEFAULT_STORY_ID, name: "Ground floor", elevation: 0 }],
    activeStoryId: DEFAULT_STORY_ID,
    spaces: [],
    walls: [],
    fenestrations: [],
    thermalZones: [],
    backgroundImages: [],
    selectedObject: null,
    activeTool: "SELECT_SPACE",
    gridSize: 1,
    snapSize: 1,
  };
}

function restoredProject(): FloorplanProject {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialProject();
    const project = JSON.parse(stored) as FloorplanProject;
    if (!project.stories?.length || !project.activeStoryId)
      return initialProject();
    const gridSize = supportedGridSpacing(project.gridSize);
    return {
      ...initialProject(),
      ...project,
      gridSize,
      snapSize: gridSize,
      walls: attachFenestrations(
        buildPhysicalWalls(project.spaces ?? []),
        project.fenestrations ?? [],
      ),
    };
  } catch {
    return initialProject();
  }
}

function supportedGridSpacing(value: number): number {
  return FLOORPLAN_GRID_SPACINGS.reduce((closest, spacing) =>
    Math.abs(spacing - value) < Math.abs(closest - value) ? spacing : closest,
  );
}

function synchronizeWalls(
  spaces: Space[],
  fenestrations: Fenestration[],
  priorWalls: PhysicalWall[],
): { walls: PhysicalWall[]; fenestrations: Fenestration[] } {
  const oldConstructionById = new Map(
    priorWalls.map((wall) => [wall.id, wall.constructionId]),
  );
  const derivedWalls = buildPhysicalWalls(spaces).map((wall) => ({
    ...wall,
    constructionId: oldConstructionById.get(wall.id),
  }));
  const wallIds = new Set(derivedWalls.map((wall) => wall.id));
  const validFenestrations = fenestrations.filter((opening) =>
    wallIds.has(opening.wallId),
  );
  return {
    walls: attachFenestrations(derivedWalls, validFenestrations),
    fenestrations: validFenestrations,
  };
}

export function createFloorplanStore() {
  const [project, setProject] =
    createStore<FloorplanProject>(restoredProject());

  createEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch {
      // A very large reference image can exceed browser storage. Geometry remains usable.
    }
  });

  function refreshWalls(
    nextSpaces: Space[],
    nextFenestrations = project.fenestrations,
  ) {
    const synchronized = synchronizeWalls(
      nextSpaces,
      nextFenestrations,
      project.walls,
    );
    setProject("spaces", nextSpaces);
    setProject("fenestrations", synchronized.fenestrations);
    setProject("walls", synchronized.walls);
  }

  function createSpace(first: Point2D, second: Point2D) {
    const start = snapPoint(first, project.snapSize);
    const end = snapPoint(second, project.snapSize);
    const width = Math.abs(end.x - start.x);
    const depth = Math.abs(end.y - start.y);
    if (width <= 0 || depth <= 0)
      return "Space width and depth must be greater than 0.";

    const space: Space = {
      id: newId("space"),
      name: `Space ${project.spaces.filter((item) => item.storyId === project.activeStoryId).length + 1}`,
      storyId: project.activeStoryId,
      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),
      width,
      depth,
      height: 3,
      floorElevation:
        project.stories.find((story) => story.id === project.activeStoryId)
          ?.elevation ?? 0,
    };
    refreshWalls([...project.spaces, space]);
    setProject("selectedObject", { type: "SPACE", id: space.id });
    return null;
  }

  function updateSpace(id: string, patch: Partial<Space>) {
    const nextSpaces = project.spaces.map((space) => {
      if (space.id !== id) return space;
      const next = { ...space, ...patch };
      return {
        ...next,
        x: snapPoint({ x: next.x, y: next.y }, project.snapSize).x,
        y: snapPoint({ x: next.x, y: next.y }, project.snapSize).y,
        width: Math.max(project.snapSize, Math.abs(next.width)),
        depth: Math.max(project.snapSize, Math.abs(next.depth)),
        height: Math.max(0.1, next.height),
      };
    });
    refreshWalls(nextSpaces);
  }

  function removeSpace(id: string) {
    refreshWalls(project.spaces.filter((space) => space.id !== id));
    setProject("selectedObject", null);
  }

  function createZone(name: string): ThermalZone {
    const usedColors = new Set(project.thermalZones.map((zone) => zone.color));
    const color =
      THERMAL_ZONE_PALETTE.find((candidate) => !usedColors.has(candidate)) ??
      THERMAL_ZONE_PALETTE[
        project.thermalZones.length % THERMAL_ZONE_PALETTE.length
      ];
    const zone = {
      id: newId("zone"),
      name: name.trim() || "Thermal zone",
      color,
    };
    setProject("thermalZones", (zones) => [...zones, zone]);
    return zone;
  }

  function assignSpaceToZone(spaceId: string, thermalZoneId?: string) {
    setProject(
      "spaces",
      project.spaces.map((space) =>
        space.id === spaceId ? { ...space, thermalZoneId } : space,
      ),
    );
  }

  function updateWallConstruction(id: string, constructionId?: string) {
    setProject(
      "walls",
      project.walls.map((wall) =>
        wall.id === id
          ? { ...wall, constructionId: constructionId || undefined }
          : wall,
      ),
    );
  }

  function saveFenestration(
    input: Omit<Fenestration, "id"> & { id?: string },
  ): string | null {
    const wall = project.walls.find((item) => item.id === input.wallId);
    if (!wall) return "The selected wall no longer exists.";
    const opening: Fenestration = {
      ...input,
      id: input.id ?? newId("opening"),
      sillHeight: isDoor(input.type) ? 0 : input.sillHeight,
    };
    const error = validateFenestration(opening, wall, project.fenestrations);
    if (error) return error;

    const nextFenestrations = input.id
      ? project.fenestrations.map((item) =>
          item.id === input.id ? opening : item,
        )
      : [...project.fenestrations, opening];
    setProject("fenestrations", nextFenestrations);
    setProject("walls", attachFenestrations(project.walls, nextFenestrations));
    setProject("selectedObject", { type: "FENESTRATION", id: opening.id });
    return null;
  }

  function removeFenestration(id: string) {
    const nextFenestrations = project.fenestrations.filter(
      (opening) => opening.id !== id,
    );
    setProject("fenestrations", nextFenestrations);
    setProject("walls", attachFenestrations(project.walls, nextFenestrations));
    setProject("selectedObject", null);
  }

  function addStory() {
    const story = {
      id: newId("story"),
      name: `Story ${project.stories.length + 1}`,
      elevation: project.stories.length * 3,
    };
    setProject("stories", (stories) => [...stories, story]);
    setProject("activeStoryId", story.id);
  }

  function saveBackgroundImage(image: BackgroundImage) {
    setProject("backgroundImages", (images) => [...images, image]);
  }

  function updateBackgroundImage(id: string, patch: Partial<BackgroundImage>) {
    setProject(
      "backgroundImages",
      project.backgroundImages.map((image) =>
        image.id === id ? { ...image, ...patch } : image,
      ),
    );
  }

  function removeBackgroundImage(id: string) {
    setProject("backgroundImages", (images) =>
      images.filter((image) => image.id !== id),
    );
  }

  function clearDraft() {
    localStorage.removeItem(STORAGE_KEY);
    setProject(reconcile(initialProject()));
  }

  function reconcile(nextProject: FloorplanProject): FloorplanProject {
    const synchronized = synchronizeWalls(
      nextProject.spaces,
      nextProject.fenestrations,
      nextProject.walls,
    );
    return { ...nextProject, ...synchronized };
  }

  return {
    project,
    setActiveTool: (activeTool: EditorTool) =>
      setProject("activeTool", activeTool),
    select: (selectedObject: Selection) =>
      setProject("selectedObject", selectedObject),
    setActiveStory: (id: string) => setProject("activeStoryId", id),
    setGrid: (gridSize: number) => {
      const spacing = supportedGridSpacing(gridSize);
      setProject("gridSize", spacing);
      setProject("snapSize", spacing);
    },
    createSpace,
    updateSpace,
    removeSpace,
    createZone,
    assignSpaceToZone,
    updateWallConstruction,
    saveFenestration,
    removeFenestration,
    addStory,
    saveBackgroundImage,
    updateBackgroundImage,
    removeBackgroundImage,
    clearDraft,
  };
}
