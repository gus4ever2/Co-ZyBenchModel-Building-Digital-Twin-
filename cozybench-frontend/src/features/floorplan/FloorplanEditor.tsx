import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  type JSX,
} from "solid-js";
import {
  Crosshair,
  DoorOpen,
  Hand,
  ImagePlus,
  Layers3,
  MousePointer2,
  Plus,
  Ruler,
  SquareDashedMousePointer,
  Trash2,
  ZoomIn,
  ZoomOut,
} from "lucide-solid";
import EditorWorkspace, {
  EditorMain,
  EditorSidebar,
} from "../../components/building-dt/EditorWorkspace";
import type {
  BackgroundImage,
  Fenestration,
  FenestrationType,
  PhysicalWall,
  Point2D,
  Selection,
  Space,
} from "./domain/types";
import { FENESTRATION_LABELS, isDoor } from "./domain/types";
import {
  pointAlongWall,
  snapPoint,
  wallLength,
} from "./geometry/floorplanGeometry";
import { createFloorplanStore } from "./state/floorplanStore";

const PIXELS_PER_METER = 50;
const SVG_WIDTH = 960;
const SVG_HEIGHT = 650;

type Viewport = { zoom: number; x: number; y: number };

type FenestrationForm = {
  id?: string;
  wallId: string;
  type: FenestrationType;
  distanceFromLeft: number;
  sillHeight: number;
  width: number;
  height: number;
  constructionId: string;
};

function defaultFenestrationForm(wallId = ""): FenestrationForm {
  return {
    wallId,
    type: "FIXED_WINDOW",
    distanceFromLeft: 0.5,
    sillHeight: 0.9,
    width: 1.2,
    height: 1.2,
    constructionId: "",
  };
}

function numericValue(event: InputEvent): number {
  return Number((event.currentTarget as HTMLInputElement).value);
}

function NumberField(props: {
  label: string;
  value: number;
  min?: number;
  step?: number;
  disabled?: boolean;
  onInput: (value: number) => void;
}) {
  return (
    <label class="block text-xs font-medium text-graphite/70">
      <span class="mb-1 block">{props.label}</span>
      <input
        type="number"
        min={props.min}
        step={props.step ?? 0.1}
        disabled={props.disabled}
        value={props.value}
        class="form-input px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        onInput={(event) => props.onInput(numericValue(event))}
      />
    </label>
  );
}

function PanelHeading(props: {
  eyebrow: string;
  title: string;
  icon?: JSX.Element;
}) {
  return (
    <div class="mb-4 flex items-start gap-2">
      <Show when={props.icon}>
        <span class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-mist/30 text-citadel-blue">
          {props.icon}
        </span>
      </Show>
      <div>
        <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-citadel-blue">
          {props.eyebrow}
        </p>
        <h2 class="text-sm font-bold text-graphite">{props.title}</h2>
      </div>
    </div>
  );
}

export default function FloorplanEditor() {
  const floorplan = createFloorplanStore();
  const { project } = floorplan;
  const [viewport, setViewport] = createSignal<Viewport>({
    zoom: 1,
    x: 120,
    y: 90,
  });
  const [draftStart, setDraftStart] = createSignal<Point2D>();
  const [cursorPoint, setCursorPoint] = createSignal<Point2D>();
  const [hoverSnapPoint, setHoverSnapPoint] = createSignal<Point2D>();
  const [hoveredObject, setHoveredObject] = createSignal<Selection>(null);
  const [status, setStatus] = createSignal("Select a tool to start editing.");
  const [zoneName, setZoneName] = createSignal("");
  const [fenestrationForm, setFenestrationForm] = createSignal(
    defaultFenestrationForm(),
  );
  const [fenestrationError, setFenestrationError] = createSignal<string>();
  let svgElement: SVGSVGElement | undefined;
  let panStart:
    | {
        clientX: number;
        clientY: number;
        viewport: Viewport;
        pointerId: number;
      }
    | undefined;

  const activeStory = createMemo(() =>
    project.stories.find((story) => story.id === project.activeStoryId),
  );
  const storySpaces = createMemo(() =>
    project.spaces.filter((space) => space.storyId === project.activeStoryId),
  );
  const storyImages = createMemo(() =>
    project.backgroundImages.filter(
      (image) => image.storyId === project.activeStoryId,
    ),
  );
  const storyWalls = createMemo(() =>
    project.walls.filter((wall) => wall.storyId === project.activeStoryId),
  );
  const selectedSpace = createMemo(() => {
    const selection = project.selectedObject;
    return selection?.type === "SPACE"
      ? project.spaces.find((space) => space.id === selection.id)
      : undefined;
  });
  const selectedWall = createMemo(() => {
    const selection = project.selectedObject;
    if (selection?.type === "WALL") {
      return project.walls.find((wall) => wall.id === selection.id);
    }
    if (selection?.type === "FENESTRATION") {
      const opening = project.fenestrations.find(
        (item) => item.id === selection.id,
      );
      return project.walls.find((wall) => wall.id === opening?.wallId);
    }
    return undefined;
  });
  const selectedFenestration = createMemo(() => {
    const selection = project.selectedObject;
    return selection?.type === "FENESTRATION"
      ? project.fenestrations.find((opening) => opening.id === selection.id)
      : undefined;
  });

  createEffect(() => {
    const opening = selectedFenestration();
    if (!opening) return;
    setFenestrationForm({
      ...opening,
      constructionId: opening.constructionId ?? "",
    });
    setFenestrationError();
  });

  function worldPoint(event: PointerEvent | WheelEvent): Point2D | undefined {
    const svg = svgElement;
    const matrix = svg?.getScreenCTM();
    if (!svg || !matrix) return undefined;
    const svgPoint = svg.createSVGPoint();
    svgPoint.x = event.clientX;
    svgPoint.y = event.clientY;
    const local = svgPoint.matrixTransform(matrix.inverse());
    const current = viewport();
    return {
      x: (local.x - current.x) / current.zoom / PIXELS_PER_METER,
      y: (local.y - current.y) / current.zoom / PIXELS_PER_METER,
    };
  }

  function snappedWorldPoint(
    event: PointerEvent | WheelEvent,
  ): Point2D | undefined {
    const point = worldPoint(event);
    return point ? snapPoint(point, project.snapSize) : undefined;
  }

  function updateHoverSnapPoint(event: PointerEvent) {
    const point = worldPoint(event);
    if (!point) return;
    const snapped = snapPoint(point, project.snapSize);
    const screenDistance =
      Math.hypot(point.x - snapped.x, point.y - snapped.y) *
      PIXELS_PER_METER *
      viewport().zoom;
    setHoverSnapPoint(screenDistance <= 14 ? snapped : undefined);
  }

  function selectTool(
    tool: "SELECT_SPACE" | "SELECT_FACE" | "SPACE_RECTANGLE" | "PAN",
  ) {
    floorplan.setActiveTool(tool);
    setDraftStart();
    setCursorPoint();
    setHoveredObject(null);
    setStatus(
      tool === "SPACE_RECTANGLE"
        ? "Click the first corner of the room."
        : tool === "PAN"
          ? "Drag the drawing to pan."
          : tool === "SELECT_SPACE"
            ? "Select a space to inspect its properties."
            : "Select a wall or opening to inspect its properties.",
    );
  }

  function beginPan(event: PointerEvent) {
    const svg = svgElement;
    if (!svg) return;
    panStart = {
      clientX: event.clientX,
      clientY: event.clientY,
      viewport: viewport(),
      pointerId: event.pointerId,
    };
    svg.setPointerCapture(event.pointerId);
  }

  function handleSvgPointerDown(event: PointerEvent) {
    if (project.activeTool === "PAN" || event.button === 1) {
      event.preventDefault();
      beginPan(event);
      return;
    }
    if (project.activeTool !== "SPACE_RECTANGLE") {
      floorplan.select(null);
      return;
    }

    const point = snappedWorldPoint(event);
    if (!point) return;
    const first = draftStart();
    if (!first) {
      setDraftStart(point);
      setCursorPoint(point);
      setStatus("Move to the opposite corner, then click to create the space.");
      return;
    }
    const error = floorplan.createSpace(first, point);
    if (error) {
      setStatus(error);
      return;
    }
    setDraftStart();
    setCursorPoint();
    setStatus("Space created. Continue drawing or choose Select.");
  }

  function handleSvgPointerMove(event: PointerEvent) {
    if (panStart) {
      const start = panStart;
      setViewport({
        ...start.viewport,
        x: start.viewport.x + event.clientX - start.clientX,
        y: start.viewport.y + event.clientY - start.clientY,
      });
      return;
    }
    if (project.activeTool === "SPACE_RECTANGLE") {
      updateHoverSnapPoint(event);
      if (draftStart()) {
        setCursorPoint(snappedWorldPoint(event));
      }
    } else {
      setHoverSnapPoint();
    }
  }

  function handleSvgPointerUp(event: PointerEvent) {
    if (panStart?.pointerId === event.pointerId) {
      svgElement?.releasePointerCapture(event.pointerId);
      panStart = undefined;
    }
  }

  function handleWheel(event: WheelEvent) {
    event.preventDefault();
    const current = viewport();
    const nextZoom = Math.min(
      3,
      Math.max(0.35, current.zoom * (event.deltaY < 0 ? 1.12 : 0.89)),
    );
    const local = worldPoint(event);
    if (!local) return;
    setViewport({
      zoom: nextZoom,
      x: current.x + local.x * PIXELS_PER_METER * (current.zoom - nextZoom),
      y: current.y + local.y * PIXELS_PER_METER * (current.zoom - nextZoom),
    });
  }

  function selectSpace(event: PointerEvent, space: Space) {
    if (project.activeTool !== "SELECT_SPACE") return;
    event.stopPropagation();
    floorplan.select({ type: "SPACE", id: space.id });
  }

  function selectWall(event: PointerEvent, wall: PhysicalWall) {
    if (project.activeTool !== "SELECT_FACE") return;
    event.stopPropagation();
    floorplan.select({ type: "WALL", id: wall.id });
    setFenestrationForm(defaultFenestrationForm(wall.id));
    setFenestrationError();
  }

  function selectFenestration(event: PointerEvent, opening: Fenestration) {
    if (project.activeTool !== "SELECT_FACE") return;
    event.stopPropagation();
    floorplan.select({ type: "FENESTRATION", id: opening.id });
  }

  function setHoveredSelection(selection: Exclude<Selection, null>) {
    const canHover =
      (selection.type === "SPACE" && project.activeTool === "SELECT_SPACE") ||
      (selection.type !== "SPACE" && project.activeTool === "SELECT_FACE");
    setHoveredObject(canHover ? selection : null);
  }

  function createZone() {
    const zone = floorplan.createZone(zoneName());
    setZoneName("");
    setStatus(`${zone.name} is ready to assign to spaces.`);
  }

  async function importReferenceImage(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    if (!/^image\/(png|jpeg)$/.test(file.type)) {
      setStatus(
        "The imported image type is not supported. Use PNG, JPG, or JPEG.",
      );
      return;
    }
    const src = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Unable to read image."));
      reader.readAsDataURL(file);
    }).catch(() => undefined);
    if (!src) {
      setStatus("Unable to import the reference image.");
      return;
    }
    const dimensions = await new Promise<{ width: number; height: number }>(
      (resolve) => {
        const image = new Image();
        image.onload = () =>
          resolve({
            width: image.naturalWidth / 100,
            height: image.naturalHeight / 100,
          });
        image.onerror = () => resolve({ width: 10, height: 10 });
        image.src = src;
      },
    );
    const image: BackgroundImage = {
      id: `reference-${crypto.randomUUID()}`,
      storyId: project.activeStoryId,
      src,
      ...dimensions,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      opacity: 0.5,
      locked: true,
      visible: true,
    };
    floorplan.saveBackgroundImage(image);
    setStatus(
      "Reference image imported and locked below the floorplan geometry.",
    );
  }

  function saveOpening() {
    const form = fenestrationForm();
    const error = floorplan.saveFenestration({
      ...form,
      constructionId: form.constructionId.trim() || undefined,
    });
    setFenestrationError(error ?? undefined);
    if (!error) {
      setStatus(
        form.id
          ? "Opening updated."
          : "Opening added to the selected physical wall.",
      );
      setFenestrationForm(defaultFenestrationForm(form.wallId));
    }
  }

  const draftRectangle = createMemo(() => {
    const start = draftStart();
    const end = cursorPoint();
    if (!start || !end) return undefined;
    return {
      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),
      width: Math.abs(end.x - start.x),
      depth: Math.abs(end.y - start.y),
    };
  });

  function spaceName(id: string | undefined) {
    return project.spaces.find((space) => space.id === id)?.name ?? "Outside";
  }

  function currentZone(space: Space) {
    return project.thermalZones.find((zone) => zone.id === space.thermalZoneId);
  }

  function openingOnWall(wall: PhysicalWall) {
    return project.fenestrations.filter(
      (opening) => opening.wallId === wall.id,
    );
  }

  return (
    <EditorWorkspace>
      <EditorSidebar>
        <div class="cozy-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pr-1">
          <section>
            <PanelHeading
              eyebrow="Floorplan"
              title="Stories"
              icon={<Layers3 class="size-4" />}
            />
            <div class="space-y-2">
              <For each={project.stories}>
                {(story) => (
                  <button
                    type="button"
                    class="flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-xs font-semibold transition"
                    classList={{
                      "border-citadel-blue bg-sky-mist/35 text-citadel-blue":
                        story.id === project.activeStoryId,
                      "border-warm-stone/20 bg-cloud-white text-graphite/70 hover:border-citadel-blue/50":
                        story.id !== project.activeStoryId,
                    }}
                    onClick={() => floorplan.setActiveStory(story.id)}
                  >
                    <span>{story.name}</span>
                    <span class="font-normal">
                      {story.elevation.toFixed(1)} m
                    </span>
                  </button>
                )}
              </For>
            </div>
            <button
              type="button"
              class="mt-2 flex items-center gap-1 text-xs font-semibold text-citadel-blue hover:underline"
              onClick={floorplan.addStory}
            >
              <Plus class="size-3.5" /> Add story
            </button>
          </section>

          <section class="border-t border-warm-stone/15 pt-5">
            <PanelHeading eyebrow="Semantic model" title="Thermal zones" />
            <div class="space-y-2">
              <For each={project.thermalZones}>
                {(zone) => (
                  <div class="flex items-center gap-2 rounded-lg bg-sky-mist/15 px-2.5 py-2 text-xs text-graphite">
                    <span
                      class="size-3 rounded-sm"
                      style={{ background: zone.color }}
                    />
                    <span class="min-w-0 flex-1 truncate">{zone.name}</span>
                  </div>
                )}
              </For>
              <Show when={project.thermalZones.length === 0}>
                <p class="rounded-lg bg-sky-mist/15 p-2.5 text-xs leading-5 text-graphite/55">
                  Create zones, then assign them to the spaces you draw.
                </p>
              </Show>
            </div>
            <div class="mt-2 flex gap-2">
              <input
                class="form-input min-w-0 px-3 py-2 text-xs"
                placeholder="Zone name"
                value={zoneName()}
                onInput={(event) => setZoneName(event.currentTarget.value)}
              />
              <button
                type="button"
                class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-citadel-blue text-cloud-white hover:bg-citadel-blue/90"
                aria-label="Create thermal zone"
                onClick={createZone}
              >
                <Plus class="size-4" />
              </button>
            </div>
          </section>

          <section class="border-t border-warm-stone/15 pt-5">
            <PanelHeading
              eyebrow="Underlay"
              title="Reference image"
              icon={<ImagePlus class="size-4" />}
            />
            <label class="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-citadel-blue/40 bg-sky-mist/15 px-3 py-3 text-xs font-semibold text-citadel-blue hover:bg-sky-mist/30">
              <ImagePlus class="size-4" /> Import PNG or JPG
              <input
                type="file"
                accept="image/png,image/jpeg"
                class="sr-only"
                onChange={importReferenceImage}
              />
            </label>
            <For each={storyImages()}>
              {(image) => (
                <div class="mt-2 rounded-xl border border-warm-stone/20 bg-sky-mist/10 p-2.5 text-xs">
                  <div class="mb-2 flex items-center justify-between gap-2 font-semibold text-graphite">
                    <span>Reference image</span>
                    <button
                      type="button"
                      class="text-red-wine hover:underline"
                      onClick={() => floorplan.removeBackgroundImage(image.id)}
                    >
                      Remove
                    </button>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <NumberField
                      label="Image width (m)"
                      value={image.width * image.scale}
                      min={0.05}
                      onInput={(width) =>
                        floorplan.updateBackgroundImage(image.id, {
                          width: Math.max(0.05, width / image.scale),
                        })
                      }
                    />
                    <NumberField
                      label="Image height (m)"
                      value={image.height * image.scale}
                      min={0.05}
                      onInput={(height) =>
                        floorplan.updateBackgroundImage(image.id, {
                          height: Math.max(0.05, height / image.scale),
                        })
                      }
                    />
                    <NumberField
                      label="X (m)"
                      value={image.x}
                      onInput={(x) =>
                        floorplan.updateBackgroundImage(image.id, { x })
                      }
                    />
                    <NumberField
                      label="Y (m)"
                      value={image.y}
                      onInput={(y) =>
                        floorplan.updateBackgroundImage(image.id, { y })
                      }
                    />
                    <NumberField
                      label="Opacity"
                      value={image.opacity}
                      min={0}
                      step={0.1}
                      onInput={(opacity) =>
                        floorplan.updateBackgroundImage(image.id, {
                          opacity: Math.min(1, opacity),
                        })
                      }
                    />
                    <NumberField
                      label="Rotation °"
                      value={image.rotation}
                      onInput={(rotation) =>
                        floorplan.updateBackgroundImage(image.id, { rotation })
                      }
                    />
                  </div>
                  <div class="mt-2 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      class="rounded-md bg-cloud-white px-2 py-1 font-semibold text-citadel-blue hover:bg-sky-mist/30"
                      onClick={() =>
                        floorplan.updateBackgroundImage(image.id, {
                          locked: !image.locked,
                        })
                      }
                    >
                      {image.locked ? "Unlock" : "Lock"}
                    </button>
                    <button
                      type="button"
                      class="rounded-md bg-cloud-white px-2 py-1 font-semibold text-citadel-blue hover:bg-sky-mist/30"
                      onClick={() =>
                        floorplan.updateBackgroundImage(image.id, {
                          visible: !image.visible,
                        })
                      }
                    >
                      {image.visible ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              )}
            </For>
          </section>

          <section class="border-t border-warm-stone/15 pt-5">
            <PanelHeading eyebrow="Grid" title="Metric precision" />
            <label class="block text-xs font-medium text-graphite/70">
              <span class="mb-1 block">Grid spacing and snap</span>
              <select
                class="form-input px-3 py-2 text-sm"
                value={project.gridSize}
                onChange={(event) => {
                  const spacing = Number(event.currentTarget.value);
                  floorplan.setGrid(spacing);
                  setStatus(
                    `Grid and snap are set to ${spacing.toFixed(2)} m. New corners will use visible grid intersections.`,
                  );
                }}
              >
                <option value={0.25}>0.25 m</option>
                <option value={0.5}>0.50 m</option>
                <option value={1}>1.00 m</option>
                <option value={2}>2.00 m</option>
              </select>
            </label>
            <p class="mt-2 text-xs leading-5 text-graphite/55">
              Space corners snap only to the visible square intersections.
            </p>
          </section>
        </div>
      </EditorSidebar>

      <EditorMain>
        <div class="flex h-full min-h-[34rem] flex-col">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-citadel-blue">
                Floorplan editor
              </p>
              <h1 class="text-lg font-bold text-graphite">
                {activeStory()?.name ?? "Floorplan"}
              </h1>
            </div>
            <div class="flex flex-wrap items-center gap-1.5">
              <ToolButton
                active={project.activeTool === "SELECT_SPACE"}
                label="Select space"
                icon={<MousePointer2 class="size-3.5" />}
                onClick={() => selectTool("SELECT_SPACE")}
              />
              <ToolButton
                active={project.activeTool === "SELECT_FACE"}
                label="Select face"
                icon={<MousePointer2 class="size-3.5" />}
                onClick={() => selectTool("SELECT_FACE")}
              />
              <ToolButton
                active={project.activeTool === "SPACE_RECTANGLE"}
                label="Rectangle"
                icon={<SquareDashedMousePointer class="size-3.5" />}
                onClick={() => selectTool("SPACE_RECTANGLE")}
              />
              <ToolButton
                active={project.activeTool === "PAN"}
                label="Pan"
                icon={<Hand class="size-3.5" />}
                onClick={() => selectTool("PAN")}
              />
              <span class="mx-1 h-6 w-px bg-warm-stone/20" />
              <ToolButton
                label="Zoom out"
                icon={<ZoomOut class="size-3.5" />}
                onClick={() =>
                  setViewport((value) => ({
                    ...value,
                    zoom: Math.max(0.35, value.zoom / 1.2),
                  }))
                }
              />
              <ToolButton
                label="Zoom in"
                icon={<ZoomIn class="size-3.5" />}
                onClick={() =>
                  setViewport((value) => ({
                    ...value,
                    zoom: Math.min(3, value.zoom * 1.2),
                  }))
                }
              />
            </div>
          </div>

          <div class="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-warm-stone/25 bg-[#fafcfb] shadow-inner">
            <svg
              ref={svgElement}
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              class="h-full min-h-[34rem] w-full touch-none select-none"
              aria-label="Metric floorplan drawing workspace"
              onPointerDown={handleSvgPointerDown}
              onPointerMove={handleSvgPointerMove}
              onPointerUp={handleSvgPointerUp}
              onPointerCancel={handleSvgPointerUp}
              onPointerLeave={() => setHoverSnapPoint()}
              onWheel={handleWheel}
            >
              <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="#fafcfb" />
              <g
                transform={`translate(${viewport().x} ${viewport().y}) scale(${viewport().zoom})`}
              >
                <GridLayer gridSize={project.gridSize} viewport={viewport()} />
                <For each={storyImages()}>
                  {(image) => (
                    <Show when={image.visible}>
                      <image
                        href={image.src}
                        x={image.x * PIXELS_PER_METER}
                        y={image.y * PIXELS_PER_METER}
                        width={image.width * PIXELS_PER_METER * image.scale}
                        height={image.height * PIXELS_PER_METER * image.scale}
                        opacity={image.opacity}
                        pointer-events={image.locked ? "none" : "all"}
                        transform={`rotate(${image.rotation} ${image.x * PIXELS_PER_METER} ${image.y * PIXELS_PER_METER})`}
                      />
                    </Show>
                  )}
                </For>
                <For each={storySpaces()}>
                  {(space) => {
                    const zone = () => currentZone(space);
                    const selected = () =>
                      project.selectedObject?.type === "SPACE" &&
                      project.selectedObject.id === space.id;
                    const hovered = () =>
                      hoveredObject()?.type === "SPACE" &&
                      hoveredObject()?.id === space.id;
                    return (
                      <g
                        onPointerDown={(event) => selectSpace(event, space)}
                        onPointerEnter={() =>
                          setHoveredSelection({ type: "SPACE", id: space.id })
                        }
                        onPointerLeave={() => setHoveredObject(null)}
                      >
                        <rect
                          x={space.x * PIXELS_PER_METER}
                          y={space.y * PIXELS_PER_METER}
                          width={space.width * PIXELS_PER_METER}
                          height={space.depth * PIXELS_PER_METER}
                          fill={zone()?.color ?? "#e8eef0"}
                          fill-opacity={
                            selected() || hovered()
                              ? zone()
                                ? 0.68
                                : 0.82
                              : zone()
                                ? 0.34
                                : 0.55
                          }
                          stroke={
                            selected() || hovered() ? "#3c6f8f" : "#71818a"
                          }
                          stroke-width={selected() ? 3 : hovered() ? 2.25 : 1}
                        />
                        <text
                          x={(space.x + space.width / 2) * PIXELS_PER_METER}
                          y={(space.y + space.depth / 2) * PIXELS_PER_METER}
                          text-anchor="middle"
                          dominant-baseline="middle"
                          font-size="12"
                          fill="#1e201d"
                          pointer-events="none"
                        >
                          {space.name}
                        </text>
                      </g>
                    );
                  }}
                </For>
                <For each={storyWalls()}>
                  {(wall) => {
                    const selected = () =>
                      project.selectedObject?.type === "WALL" &&
                      project.selectedObject.id === wall.id;
                    const hovered = () =>
                      hoveredObject()?.type === "WALL" &&
                      hoveredObject()?.id === wall.id;
                    return (
                      <g>
                        <line
                          x1={wall.start.x * PIXELS_PER_METER}
                          y1={wall.start.y * PIXELS_PER_METER}
                          x2={wall.end.x * PIXELS_PER_METER}
                          y2={wall.end.y * PIXELS_PER_METER}
                          stroke={
                            selected()
                              ? "#3c6f8f"
                              : hovered()
                                ? "#5b89a3"
                                : "#1e201d"
                          }
                          stroke-width={selected() || hovered() ? 3 : 1.5}
                          pointer-events="none"
                        />
                        <line
                          x1={wall.start.x * PIXELS_PER_METER}
                          y1={wall.start.y * PIXELS_PER_METER}
                          x2={wall.end.x * PIXELS_PER_METER}
                          y2={wall.end.y * PIXELS_PER_METER}
                          stroke="transparent"
                          stroke-width="16"
                          pointer-events={
                            project.activeTool === "SELECT_FACE"
                              ? "stroke"
                              : "none"
                          }
                          onPointerDown={(event) => selectWall(event, wall)}
                          onPointerEnter={() =>
                            setHoveredSelection({ type: "WALL", id: wall.id })
                          }
                          onPointerLeave={() => setHoveredObject(null)}
                        />
                      </g>
                    );
                  }}
                </For>
                <For each={project.fenestrations}>
                  {(opening) => {
                    const wall = () =>
                      project.walls.find((item) => item.id === opening.wallId);
                    const selected = () =>
                      project.selectedObject?.type === "FENESTRATION" &&
                      project.selectedObject.id === opening.id;
                    const hovered = () =>
                      hoveredObject()?.type === "FENESTRATION" &&
                      hoveredObject()?.id === opening.id;
                    return (
                      <Show when={wall()}>
                        <FloorplanFenestrationSymbol
                          opening={opening}
                          wall={wall()!}
                          selected={selected()}
                          hovered={hovered()}
                          interactive={project.activeTool === "SELECT_FACE"}
                          onSelect={(event) =>
                            selectFenestration(event, opening)
                          }
                          onHover={() =>
                            setHoveredSelection({
                              type: "FENESTRATION",
                              id: opening.id,
                            })
                          }
                          onLeave={() => setHoveredObject(null)}
                        />
                      </Show>
                    );
                  }}
                </For>
                <Show when={draftRectangle()}>
                  {(rectangle) => (
                    <rect
                      x={rectangle().x * PIXELS_PER_METER}
                      y={rectangle().y * PIXELS_PER_METER}
                      width={rectangle().width * PIXELS_PER_METER}
                      height={rectangle().depth * PIXELS_PER_METER}
                      fill="#3c6f8f"
                      fill-opacity="0.16"
                      stroke="#3c6f8f"
                      stroke-width="2"
                      stroke-dasharray="6 4"
                      pointer-events="none"
                    />
                  )}
                </Show>
                <Show when={hoverSnapPoint()}>
                  {(point) => {
                    const size = 12 / viewport().zoom;
                    return (
                      <rect
                        x={point().x * PIXELS_PER_METER - size / 2}
                        y={point().y * PIXELS_PER_METER - size / 2}
                        width={size}
                        height={size}
                        rx={2 / viewport().zoom}
                        fill="#f1f3f2"
                        fill-opacity="0.9"
                        stroke="#3c6f8f"
                        stroke-width={1.5 / viewport().zoom}
                        pointer-events="none"
                      />
                    );
                  }}
                </Show>
              </g>
            </svg>
            <div class="absolute bottom-3 left-3 flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-lg border border-warm-stone/20 bg-cloud-white/95 px-3 py-2 text-xs text-graphite/70 shadow-sm">
              <Crosshair class="size-3.5 shrink-0 text-citadel-blue" />
              <span>{status()}</span>
            </div>
          </div>
        </div>
      </EditorMain>

      <EditorSidebar>
        <div class="cozy-scrollbar min-h-0 flex-1 overflow-y-auto pr-1">
          <Show
            when={selectedSpace()}
            keyed
            fallback={
              <Show when={selectedWall()} keyed fallback={<EmptyProperties />}>
                <WallProperties />
              </Show>
            }
          >
            <SpaceProperties />
          </Show>
        </div>
      </EditorSidebar>
    </EditorWorkspace>
  );

  function SpaceProperties() {
    const space = selectedSpace()!;
    return (
      <section>
        <PanelHeading
          eyebrow="Selected space"
          title={space.name}
          icon={<Ruler class="size-4" />}
        />
        <div class="space-y-3">
          <label class="block text-xs font-medium text-graphite/70">
            <span class="mb-1 block">Name</span>
            <input
              class="form-input px-3 py-2 text-sm"
              value={space.name}
              onInput={(event) =>
                floorplan.updateSpace(space.id, {
                  name: event.currentTarget.value,
                })
              }
            />
          </label>
          <div class="grid grid-cols-2 gap-2">
            <NumberField
              label="X (m)"
              value={space.x}
              onInput={(x) => floorplan.updateSpace(space.id, { x })}
            />
            <NumberField
              label="Y (m)"
              value={space.y}
              onInput={(y) => floorplan.updateSpace(space.id, { y })}
            />
            <NumberField
              label="Width (m)"
              value={space.width}
              min={project.snapSize}
              onInput={(width) => floorplan.updateSpace(space.id, { width })}
            />
            <NumberField
              label="Depth (m)"
              value={space.depth}
              min={project.snapSize}
              onInput={(depth) => floorplan.updateSpace(space.id, { depth })}
            />
            <NumberField
              label="Height (m)"
              value={space.height}
              min={0.1}
              onInput={(height) => floorplan.updateSpace(space.id, { height })}
            />
          </div>
          <label class="block text-xs font-medium text-graphite/70">
            <span class="mb-1 block">Thermal zone</span>
            <select
              class="form-input px-3 py-2 text-sm"
              value={space.thermalZoneId ?? ""}
              onChange={(event) =>
                floorplan.assignSpaceToZone(
                  space.id,
                  event.currentTarget.value || undefined,
                )
              }
            >
              <option value="">Unassigned</option>
              <For each={project.thermalZones}>
                {(zone) => <option value={zone.id}>{zone.name}</option>}
              </For>
            </select>
          </label>
          <button
            type="button"
            class="flex items-center gap-1 text-xs font-semibold text-red-wine hover:underline"
            onClick={() => floorplan.removeSpace(space.id)}
          >
            <Trash2 class="size-3.5" /> Delete space
          </button>
        </div>
      </section>
    );
  }

  function WallProperties() {
    const wall = selectedWall()!;
    const selectedOpening = selectedFenestration();
    const form = fenestrationForm();
    const wallOpenings = openingOnWall(wall);
    return (
      <section>
        <PanelHeading
          eyebrow="Physical wall"
          title={`${spaceName(wall.spaceAId)} ↔ ${spaceName(wall.spaceBId)}`}
          icon={<DoorOpen class="size-4" />}
        />
        <dl class="grid grid-cols-2 gap-2 rounded-xl bg-sky-mist/15 p-3 text-xs">
          <Info label="Length" value={`${wallLength(wall).toFixed(2)} m`} />
          <Info label="Height" value={`${wall.height.toFixed(2)} m`} />
          <Info label="Type" value={wall.spaceBId ? "Shared" : "Exterior"} />
          <Info label="Openings" value={String(wallOpenings.length)} />
        </dl>
        <label class="mt-3 block text-xs font-medium text-graphite/70">
          <span class="mb-1 block">Construction ID</span>
          <input
            class="form-input px-3 py-2 text-sm"
            placeholder="Optional construction identifier"
            value={wall.constructionId ?? ""}
            onInput={(event) =>
              floorplan.updateWallConstruction(
                wall.id,
                event.currentTarget.value,
              )
            }
          />
        </label>
        <div class="mt-5 border-t border-warm-stone/15 pt-4">
          <PanelHeading eyebrow="Wall elevation" title="Fenestrations" />
          <WallElevation
            wall={wall}
            openings={wallOpenings}
            selectedOpeningId={selectedOpening?.id}
            onSelect={(opening) => {
              floorplan.select({ type: "FENESTRATION", id: opening.id });
              setFenestrationForm({
                ...opening,
                constructionId: opening.constructionId ?? "",
              });
            }}
          />
          <div class="mt-4 rounded-xl border border-warm-stone/20 bg-sky-mist/10 p-3">
            <p class="mb-3 text-xs font-bold text-graphite">
              {form.id ? "Edit opening" : "Add opening"}
            </p>
            <div class="space-y-2">
              <label class="block text-xs font-medium text-graphite/70">
                <span class="mb-1 block">Type</span>
                <select
                  class="form-input px-3 py-2 text-sm"
                  value={form.type}
                  onChange={(event) =>
                    setFenestrationForm((value) => ({
                      ...value,
                      type: event.currentTarget.value as FenestrationType,
                      sillHeight: isDoor(
                        event.currentTarget.value as FenestrationType,
                      )
                        ? 0
                        : value.sillHeight,
                    }))
                  }
                >
                  <For each={Object.entries(FENESTRATION_LABELS)}>
                    {([value, label]) => <option value={value}>{label}</option>}
                  </For>
                </select>
              </label>
              <div class="grid grid-cols-2 gap-2">
                <NumberField
                  label="Left (m)"
                  value={form.distanceFromLeft}
                  min={0}
                  onInput={(distanceFromLeft) =>
                    setFenestrationForm((value) => ({
                      ...value,
                      wallId: wall.id,
                      distanceFromLeft,
                    }))
                  }
                />
                <NumberField
                  label="Width (m)"
                  value={form.width}
                  min={0.01}
                  onInput={(width) =>
                    setFenestrationForm((value) => ({
                      ...value,
                      wallId: wall.id,
                      width,
                    }))
                  }
                />
                <NumberField
                  label="Sill (m)"
                  value={form.sillHeight}
                  min={0}
                  disabled={isDoor(form.type)}
                  onInput={(sillHeight) =>
                    setFenestrationForm((value) => ({
                      ...value,
                      wallId: wall.id,
                      sillHeight,
                    }))
                  }
                />
                <NumberField
                  label="Height (m)"
                  value={form.height}
                  min={0.01}
                  onInput={(height) =>
                    setFenestrationForm((value) => ({
                      ...value,
                      wallId: wall.id,
                      height,
                    }))
                  }
                />
              </div>
              <label class="block text-xs font-medium text-graphite/70">
                <span class="mb-1 block">Construction ID</span>
                <input
                  class="form-input px-3 py-2 text-sm"
                  value={form.constructionId}
                  onInput={(event) =>
                    setFenestrationForm((value) => ({
                      ...value,
                      wallId: wall.id,
                      constructionId: event.currentTarget.value,
                    }))
                  }
                />
              </label>
              <Show when={fenestrationError()}>
                {(error) => (
                  <p class="rounded-lg bg-red-wine/10 px-2.5 py-2 text-xs leading-5 text-red-wine">
                    {error()}
                  </p>
                )}
              </Show>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="flex-1 rounded-lg bg-citadel-blue px-3 py-2 text-xs font-semibold text-cloud-white hover:bg-citadel-blue/90"
                  onClick={saveOpening}
                >
                  {form.id ? "Save" : "Add opening"}
                </button>
                <Show when={form.id}>
                  <button
                    type="button"
                    class="rounded-lg border border-red-wine/30 px-3 py-2 text-xs font-semibold text-red-wine hover:bg-red-wine/10"
                    onClick={() => floorplan.removeFenestration(form.id!)}
                  >
                    Delete
                  </button>
                </Show>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

function ToolButton(props: {
  active?: boolean;
  label: string;
  icon: JSX.Element;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={props.label}
      class="flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-semibold transition"
      classList={{
        "border-citadel-blue bg-citadel-blue text-cloud-white": props.active,
        "border-warm-stone/25 bg-cloud-white text-graphite/70 hover:border-citadel-blue/50 hover:text-citadel-blue":
          !props.active,
      }}
      onClick={props.onClick}
    >
      {props.icon}
      <span class="hidden sm:inline">{props.label}</span>
    </button>
  );
}

function GridLayer(props: { gridSize: number; viewport: Viewport }) {
  const spacing = () => props.gridSize * PIXELS_PER_METER;

  // Calculate the visible world coordinates after pan and zoom. The extra
  // margin also covers the SVG's letterboxed area on different screen sizes.
  const bounds = createMemo(() => {
    const { x, y, zoom } = props.viewport;
    return {
      left: (-SVG_WIDTH / 2 - x) / zoom,
      right: (SVG_WIDTH * 1.5 - x) / zoom,
      top: (-SVG_HEIGHT / 2 - y) / zoom,
      bottom: (SVG_HEIGHT * 1.5 - y) / zoom,
    };
  });

  function gridLines(start: number, end: number) {
    const first = Math.floor(start / spacing());
    const last = Math.ceil(end / spacing());
    return Array.from({ length: last - first + 1 }, (_, offset) => {
      const index = first + offset;
      return { position: index * spacing(), index };
    });
  }

  const verticalLines = createMemo(() =>
    gridLines(bounds().left, bounds().right),
  );
  const horizontalLines = createMemo(() =>
    gridLines(bounds().top, bounds().bottom),
  );

  return (
    <g pointer-events="none">
      <g stroke="#c7d4da" stroke-width="1" opacity="0.65">
        <For each={verticalLines()}>
          {(line) => (
            <line
              x1={line.position}
              y1={bounds().top}
              x2={line.position}
              y2={bounds().bottom}
            />
          )}
        </For>
        <For each={horizontalLines()}>
          {(line) => (
            <line
              x1={bounds().left}
              y1={line.position}
              x2={bounds().right}
              y2={line.position}
            />
          )}
        </For>
      </g>

      <g
        stroke="#1e201d"
        stroke-width="2.25"
        vector-effect="non-scaling-stroke"
      >
        <line x1={bounds().left} y1={0} x2={bounds().right} y2={0} />
        <line x1={0} y1={bounds().bottom} x2={0} y2={bounds().top} />
      </g>

      <g
        fill="#1e201d"
        font-size="11"
        font-family="ui-sans-serif, system-ui, sans-serif"
        font-weight="600"
      >
        <For
          each={verticalLines().filter(
            (line) => line.index !== 0 && line.index % 5 === 0,
          )}
        >
          {(line) => (
            <text x={line.position} y={-8} text-anchor="middle">
              {Number((line.position / PIXELS_PER_METER).toFixed(2))}
            </text>
          )}
        </For>
        <For
          each={horizontalLines().filter(
            (line) => line.index !== 0 && line.index % 5 === 0,
          )}
        >
          {(line) => (
            <text x={8} y={line.position + 4}>
              {Number((-line.position / PIXELS_PER_METER).toFixed(2))}
            </text>
          )}
        </For>
        <text x={8} y={-8} font-size="12" font-weight="800">
          0, 0
        </text>
      </g>
    </g>
  );
}

function Info(props: { label: string; value: string }) {
  return (
    <div>
      <dt class="text-graphite/55">{props.label}</dt>
      <dd class="mt-0.5 font-bold text-graphite">{props.value}</dd>
    </div>
  );
}

function EmptyProperties() {
  return (
    <div class="flex h-full min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-warm-stone/30 bg-sky-mist/10 p-6 text-center">
      <MousePointer2 class="mb-3 size-6 text-citadel-blue" />
      <p class="text-sm font-bold text-graphite">Nothing selected</p>
      <p class="mt-1 text-xs leading-5 text-graphite/55">
        Select a space, physical wall, or opening to edit its model properties.
      </p>
    </div>
  );
}

/** A top-view, CAD-style opening symbol. Geometry remains wall-local. */
function FloorplanFenestrationSymbol(props: {
  opening: Fenestration;
  wall: PhysicalWall;
  selected: boolean;
  hovered: boolean;
  interactive: boolean;
  onSelect: (event: PointerEvent) => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  const start = pointAlongWall(props.wall, props.opening.distanceFromLeft);
  const vectorX = props.wall.end.x - props.wall.start.x;
  const vectorY = props.wall.end.y - props.wall.start.y;
  const angle = (Math.atan2(vectorY, vectorX) * 180) / Math.PI;
  const openingWidth = props.opening.width * PIXELS_PER_METER;
  const openingColor = props.selected
    ? "#c57952"
    : props.hovered
      ? "#5b89a3"
      : "#3c6f8f";
  const doorColor = props.opening.type === "GLASS_DOOR" ? "#3c6f8f" : "#4d4936";

  return (
    <g
      transform={`translate(${start.x * PIXELS_PER_METER} ${start.y * PIXELS_PER_METER}) rotate(${angle})`}
      class="cursor-pointer"
      pointer-events={props.interactive ? "all" : "none"}
      onPointerDown={props.onSelect}
      onPointerEnter={props.onHover}
      onPointerLeave={props.onLeave}
    >
      <rect
        x={-8}
        y={-12}
        width={openingWidth + 16}
        height={24}
        fill="transparent"
      />
      <Show
        when={!isDoor(props.opening.type)}
        fallback={
          <>
            <rect
              x={-2}
              y={-5}
              width={openingWidth + 4}
              height={10}
              fill="#fafcfb"
              stroke="none"
            />
            <path
              d={`M ${openingWidth} 0 A ${openingWidth} ${openingWidth} 0 0 0 0 ${openingWidth}`}
              fill="none"
              stroke={doorColor}
              stroke-width="1.5"
              stroke-dasharray={
                props.opening.type === "GLASS_DOOR" ? "3 2" : undefined
              }
            />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2={openingWidth}
              stroke={doorColor}
              stroke-width="2.5"
            />
            <circle cx="0" cy="0" r="3" fill={doorColor} />
          </>
        }
      >
        <rect
          x={-2}
          y={-5}
          width={openingWidth + 4}
          height={10}
          rx="1"
          fill="#d9edf2"
          stroke={openingColor}
          stroke-width="2"
        />
        <Show when={props.opening.type === "OPERABLE_WINDOW"}>
          <path
            d={`M 3 -3 L ${Math.max(3, openingWidth - 3)} 3`}
            fill="none"
            stroke={openingColor}
            stroke-width="1.5"
          />
        </Show>
      </Show>
      <Show when={props.selected}>
        <rect
          x={-6}
          y={-10}
          width={openingWidth + 12}
          height={20}
          rx="3"
          fill="none"
          stroke="#c57952"
          stroke-width="1.5"
          stroke-dasharray="3 2"
        />
      </Show>
    </g>
  );
}

function WallElevation(props: {
  wall: PhysicalWall;
  openings: Fenestration[];
  selectedOpeningId?: string;
  onSelect: (opening: Fenestration) => void;
}) {
  const width = () => wallLength(props.wall);
  const scale = 52;
  const padding = 28;
  const svgWidth = () => Math.max(300, width() * scale + padding * 2);
  const svgHeight = () =>
    Math.max(190, props.wall.height * scale + padding * 2);
  return (
    <div class="overflow-x-auto rounded-xl border border-warm-stone/20 bg-cloud-white p-2">
      <p class="mb-1 flex justify-between text-[10px] font-bold tracking-wide text-graphite/55">
        <span>LEFT</span>
        <span>RIGHT</span>
      </p>
      <svg
        viewBox={`0 0 ${svgWidth()} ${svgHeight()}`}
        class="h-48 min-w-[300px]"
        aria-label="Wall elevation"
      >
        <rect
          x={padding}
          y={padding}
          width={width() * scale}
          height={props.wall.height * scale}
          fill="#e7edef"
          stroke="#4d4936"
          stroke-width="2"
        />
        <For each={props.openings}>
          {(opening) => (
            <rect
              x={padding + opening.distanceFromLeft * scale}
              y={
                padding +
                (props.wall.height - opening.sillHeight - opening.height) *
                  scale
              }
              width={opening.width * scale}
              height={opening.height * scale}
              fill={
                opening.id === props.selectedOpeningId
                  ? "#c57952"
                  : isDoor(opening.type)
                    ? "#946b9b"
                    : "#4e89ae"
              }
              fill-opacity="0.75"
              stroke="#1e201d"
              stroke-width="1.2"
              class="cursor-pointer"
              onPointerDown={(event) => {
                event.stopPropagation();
                props.onSelect(opening);
              }}
            />
          )}
        </For>
      </svg>
      <div class="mt-1 flex justify-between text-[10px] text-graphite/55">
        <span>0 m</span>
        <span>{width().toFixed(2)} m</span>
      </div>
    </div>
  );
}
