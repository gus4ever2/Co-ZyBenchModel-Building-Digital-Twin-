export type Point2D = {
  x: number;
  y: number;
};

export type EditorTool =
  "SELECT_SPACE" | "SELECT_FACE" | "SPACE_RECTANGLE" | "PAN";

export type Selection =
  | { type: "SPACE"; id: string }
  | { type: "WALL"; id: string }
  | { type: "FENESTRATION"; id: string }
  | null;

export type Story = {
  id: string;
  name: string;
  elevation: number;
};

export type Space = {
  id: string;
  name: string;
  storyId: string;
  x: number;
  y: number;
  width: number;
  depth: number;
  height: number;
  floorElevation: number;
  thermalZoneId?: string;
};

/** A user-facing wall. Shared walls are represented exactly once. */
export type PhysicalWall = {
  id: string;
  storyId: string;
  start: Point2D;
  end: Point2D;
  height: number;
  spaceAId: string;
  spaceBId?: string;
  constructionId?: string;
  fenestrationIds: string[];
};

export type ThermalZone = {
  id: string;
  name: string;
  color: string;
};

export type FenestrationType =
  "FIXED_WINDOW" | "OPERABLE_WINDOW" | "GLASS_DOOR" | "OPAQUE_DOOR";

export type Fenestration = {
  id: string;
  wallId: string;
  type: FenestrationType;
  distanceFromLeft: number;
  sillHeight: number;
  width: number;
  height: number;
  constructionId?: string;
};

export type BackgroundImage = {
  id: string;
  storyId: string;
  src: string;
  width: number;
  height: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
};

export type FloorplanProject = {
  stories: Story[];
  activeStoryId: string;
  spaces: Space[];
  walls: PhysicalWall[];
  fenestrations: Fenestration[];
  thermalZones: ThermalZone[];
  backgroundImages: BackgroundImage[];
  selectedObject: Selection;
  activeTool: EditorTool;
  gridSize: number;
  snapSize: number;
};

export const THERMAL_ZONE_PALETTE = [
  "#4e89ae",
  "#c57952",
  "#758d5d",
  "#946b9b",
  "#b8903b",
  "#467f76",
  "#a95e72",
  "#6677a8",
] as const;

/** Supported intervals keep every snapped corner on a visible grid node. */
export const FLOORPLAN_GRID_SPACINGS = [0.25, 0.5, 1, 2] as const;

export const FENESTRATION_LABELS: Record<FenestrationType, string> = {
  FIXED_WINDOW: "Fixed window",
  OPERABLE_WINDOW: "Operable window",
  GLASS_DOOR: "Glass door",
  OPAQUE_DOOR: "Opaque door",
};

export function isDoor(type: FenestrationType): boolean {
  return type === "GLASS_DOOR" || type === "OPAQUE_DOOR";
}
