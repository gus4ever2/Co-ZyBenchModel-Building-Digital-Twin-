import {
  For,
  Match,
  Show,
  Switch,
  createEffect,
  createMemo,
  createSignal,
} from "solid-js";
import {
  createMutation,
  createQuery,
  keepPreviousData,
  useQueryClient,
} from "@tanstack/solid-query";
import {
  BrickWall,
  Copy,
  Library,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-solid";
import { z } from "zod";
import EditorIdentityHeader from "../../components/form/EditorIdentityHeader";
import EditorEmptyState from "../../components/building-dt/EditorEmptyState";
import EditorNotification from "../../components/building-dt/EditorNotification";
import { EditorCreateButton } from "../../components/building-dt/EditorSidebarControls";
import EditorWorkspace, {
  EditorMain,
  EditorSidebar,
} from "../../components/building-dt/EditorWorkspace";
import { materialTypes } from "../materials/materialTypes";
import {
  addConstruction,
  createConstruction,
  deleteConstruction,
  duplicateConstruction,
  loadConstructions,
  updateConstruction,
  type ConstructionComponent,
  type ConstructionState,
  type Descriptor,
} from "./constructionService";
import {
  constructionIddMetadata,
  type ConstructionField,
} from "./constructionIddMetadata";
import {
  constructionTypeLabel,
  constructionTypes,
  opaqueMaterialTypes,
  windowMaterialTypes,
  type ConstructionType,
} from "./constructionTypes";

const layerKeys = [
  "Outside_Layer",
  "Layer_2",
  "Layer_3",
  "Layer_4",
  "Layer_5",
  "Layer_6",
  "Layer_7",
  "Layer_8",
  "Layer_9",
  "Layer_10",
];

function validateField(definition: ConstructionField) {
  return z.string().superRefine((text, context) => {
    if (!text.trim()) {
      if (definition.required)
        context.addIssue({
          code: "custom",
          message: `${definition.label} is required.`,
        });
      return;
    }
    if (definition.type === "choice" && !definition.keys?.includes(text))
      context.addIssue({ code: "custom", message: "Select a valid value." });
    if (definition.type !== "real" && definition.type !== "integer") return;
    const number = Number(text);
    if (!Number.isFinite(number)) {
      context.addIssue({ code: "custom", message: "Enter a valid number." });
      return;
    }
    if (definition.type === "integer" && !Number.isInteger(number))
      context.addIssue({ code: "custom", message: "Enter a whole number." });
    if (
      definition.min !== undefined &&
      (definition.exclusiveMin
        ? number <= definition.min
        : number < definition.min)
    )
      context.addIssue({
        code: "custom",
        message: `Value must be ${definition.exclusiveMin ? "greater than" : "at least"} ${definition.min}.`,
      });
    if (definition.max !== undefined && number > definition.max)
      context.addIssue({
        code: "custom",
        message: `Value must be at most ${definition.max}.`,
      });
  });
}

function StandardConstructionForm(props: {
  component: ConstructionComponent;
  constructions: Descriptor[];
  onSave: (values: Record<string, string>) => Promise<void>;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [values, setValues] = createSignal<Record<string, string>>({});
  const [errors, setErrors] = createSignal<Record<string, string>>({});
  const [constructionOpen, setConstructionOpen] = createSignal(false);
  const definitions = createMemo(
    () => constructionIddMetadata[props.component.type] ?? {},
  );
  const isInternalHeatSource = () =>
    props.component.type === "CONSTRUCTION_PROPERTY_INTERNAL_HEAT_SOURCE";

  createEffect(() =>
    setValues(
      Object.fromEntries(
        Object.entries(props.component.properties).map(([key, value]) => [
          key,
          value ?? "",
        ]),
      ),
    ),
  );

  const save = async () => {
    const nextErrors: Record<string, string> = {};
    for (const [key, definition] of Object.entries(definitions())) {
      const result = validateField(definition).safeParse(values()[key] ?? "");
      if (!result.success)
        nextErrors[key] = result.error.issues[0]?.message ?? "Invalid value.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    await props.onSave({ ...values() });
  };

  const eligibleConstructions = () =>
    props.constructions.filter((item) => item.type === "CONSTRUCTION");

  return (
    <div class="flex h-full min-h-0 flex-col">
      <EditorIdentityHeader
        eyebrow={constructionTypeLabel(props.component.type)}
        title="Construction properties"
        actions={
          <div class="flex gap-2">
            <button
              type="button"
              title="Duplicate"
              class="rounded-xl border border-citadel-blue/25 p-2.5 text-citadel-blue hover:bg-citadel-blue/10"
              onClick={props.onDuplicate}
            >
              <Copy class="size-4" />
            </button>
            <button
              type="button"
              title="Delete"
              class="rounded-xl border border-error/25 p-2.5 text-error hover:bg-error/10"
              onClick={props.onDelete}
            >
              <Trash2 class="size-4" />
            </button>
          </div>
        }
      />
      <div class="mb-5 grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <label class="min-w-0">
          <span class="mb-1.5 block text-sm font-semibold text-graphite">
            Name
          </span>
          <input
            class="form-input py-2.5"
            value={values().Name ?? ""}
            readOnly={isInternalHeatSource()}
            aria-invalid={Boolean(errors().Name)}
            onInput={(event) =>
              setValues((current) => ({
                ...current,
                Name: event.currentTarget.value,
              }))
            }
          />
          <Show when={isInternalHeatSource()}>
            <span class="mt-1 block text-xs text-graphite/60">
              The name is generated from the selected construction.
            </span>
          </Show>
          <Show when={errors().Name}>
            <span class="mt-1 block text-xs text-error">{errors().Name}</span>
          </Show>
        </label>
        <button
          type="button"
          class="mt-[1.625rem] inline-flex h-[2.9rem] items-center gap-2 rounded-xl bg-citadel-blue px-5 font-semibold text-cloud-white shadow-lg shadow-citadel-blue/20 hover:bg-citadel-blue/90"
          onClick={() => void save()}
        >
          <Save class="size-4" />{" "}
          <span class="hidden sm:inline">Save construction</span>
          <span class="sm:hidden">Save</span>
        </button>
      </div>
      <div class="cozy-scrollbar min-h-0 flex-1 overflow-y-auto pr-2">
        <Show when={isInternalHeatSource()}>
          <article class="relative mb-6 max-w-md rounded-2xl border border-warm-stone/20 bg-sky-mist/8 p-4">
            <p class="mb-3 text-sm font-bold text-graphite">Construction</p>
            <Show
              when={values().Construction_Name}
              fallback={
                <button
                  type="button"
                  class="flex w-full items-center justify-between rounded-xl border border-dashed border-citadel-blue/35 bg-cloud-white px-3 py-3 text-left text-sm font-semibold text-citadel-blue hover:bg-citadel-blue/5"
                  onClick={() => setConstructionOpen((open) => !open)}
                >
                  <span>Assign construction</span>
                  <Plus class="size-4" />
                </button>
              }
            >
              {(assigned) => (
                <div class="flex items-start gap-2 rounded-xl border border-citadel-blue/25 bg-citadel-blue/8 p-3">
                  <span title={assigned()} class="min-w-0 flex-1 break-words text-sm font-semibold leading-5 text-graphite">
                    {assigned()}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${assigned()}`}
                    class="flex size-7 shrink-0 items-center justify-center rounded-full bg-citadel-blue text-cloud-white"
                    onClick={() => {
                      setValues((current) => ({ ...current, Construction_Name: "", Name: "" }));
                      setConstructionOpen(false);
                    }}
                  >
                    <X class="size-3.5" />
                  </button>
                </div>
              )}
            </Show>
            <Show when={constructionOpen()}>
              <div class="cozy-scrollbar absolute left-4 right-4 top-[5.8rem] z-30 max-h-64 space-y-1 overflow-y-auto rounded-xl border border-warm-stone/25 bg-cloud-white p-2 shadow-2xl">
                <For each={eligibleConstructions()} fallback={<p class="p-3 text-xs text-graphite/50">Create a layered construction first.</p>}>
                  {(item) => (
                    <button
                      type="button"
                      title={item.name}
                      class="block w-full rounded-lg px-3 py-2.5 text-left text-xs font-semibold leading-5 text-graphite hover:bg-sky-mist/20"
                      onClick={() => {
                        setValues((current) => ({
                          ...current,
                          Construction_Name: item.name,
                          Name: `${item.name} Internal Heat Source`,
                        }));
                        setConstructionOpen(false);
                      }}
                    >
                      {item.name}
                    </button>
                  )}
                </For>
              </div>
            </Show>
            <Show when={errors().Construction_Name}>
              <p class="mt-1 text-xs text-error">{errors().Construction_Name}</p>
            </Show>
          </article>
          <h2 class="mb-4 text-lg font-bold text-graphite">Internal heat source properties</h2>
        </Show>
        <div class="grid gap-5 md:grid-cols-2">
          <For
            each={Object.entries(definitions()).filter(
              ([key]) => key !== "Name" && !(isInternalHeatSource() && key === "Construction_Name"),
            )}
          >
            {([key, definition]) => (
              <label class="relative block min-w-0">
                <span class="mb-1.5 block text-sm font-semibold text-graphite">
                  {definition.label}
                  <Show when={definition.unit}>
                    {" "}
                    <span class="font-normal text-graphite/45">
                      ({definition.unit})
                    </span>
                  </Show>
                </span>
                <Switch>
                  <Match when={definition.type === "choice"}>
                    <select
                      class="form-input py-2.5"
                      value={values()[key] ?? ""}
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          [key]: event.currentTarget.value,
                        }))
                      }
                    >
                      <option value="">Select…</option>
                      <For each={definition.keys ?? []}>
                        {(option) => <option value={option}>{option}</option>}
                      </For>
                    </select>
                  </Match>
                  <Match when={definition.type === "construction"}>
                    <button
                      type="button"
                      title={values()[key]}
                      class="form-input flex min-h-11 items-center justify-between py-2.5 text-left"
                      onClick={() => setConstructionOpen((open) => !open)}
                    >
                      <span class="min-w-0 truncate">
                        {values()[key] || "Select construction"}
                      </span>
                      <Plus class="size-4 shrink-0 text-citadel-blue" />
                    </button>
                    <Show when={constructionOpen()}>
                      <div class="cozy-scrollbar absolute left-0 right-0 top-full z-30 mt-1 max-h-64 space-y-1 overflow-y-auto rounded-xl border border-warm-stone/25 bg-cloud-white p-2 shadow-2xl">
                        <For
                          each={eligibleConstructions()}
                          fallback={
                            <p class="p-3 text-xs text-graphite/50">
                              Create a layered construction first.
                            </p>
                          }
                        >
                          {(item) => (
                            <button
                              type="button"
                              title={item.name}
                              class="block w-full rounded-lg px-3 py-2.5 text-left text-xs font-semibold leading-5 text-graphite hover:bg-sky-mist/20"
                              onClick={() => {
                                setValues((current) => ({
                                  ...current,
                                  [key]: item.name,
                                  ...(isInternalHeatSource()
                                    ? { Name: `${item.name} Internal Heat Source` }
                                    : {}),
                                }));
                                setConstructionOpen(false);
                              }}
                            >
                              {item.name}
                            </button>
                          )}
                        </For>
                      </div>
                    </Show>
                  </Match>
                  <Match when={true}>
                    <input
                      class="form-input py-2.5"
                      type={
                        definition.type === "real" ||
                        definition.type === "integer"
                          ? "number"
                          : "text"
                      }
                      step={definition.type === "integer" ? "1" : "any"}
                      value={values()[key] ?? ""}
                      aria-invalid={Boolean(errors()[key])}
                      onInput={(event) =>
                        setValues((current) => ({
                          ...current,
                          [key]: event.currentTarget.value,
                        }))
                      }
                    />
                  </Match>
                </Switch>
                <Show when={errors()[key]}>
                  <span class="mt-1 block text-xs text-error">
                    {errors()[key]}
                  </span>
                </Show>
              </label>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}

function LayeredConstructionForm(props: {
  component: ConstructionComponent;
  materials: Descriptor[];
  onSave: (values: Record<string, string>) => Promise<void>;
  onError: (message: string) => void;
  clearError: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [name, setName] = createSignal("");
  const [layers, setLayers] = createSignal<string[]>([]);
  const [openType, setOpenType] = createSignal<string | null>(null);
  createEffect(() => {
    setName(props.component.properties.Name ?? "");
    setLayers(
      layerKeys
        .map((key) => props.component.properties[key] ?? "")
        .filter(Boolean),
    );
    props.clearError();
  });

  const descriptorFor = (materialName: string) =>
    props.materials.find((item) => item.name === materialName);
  const category = createMemo<"opaque" | "window" | null>(() => {
    const type = descriptorFor(layers()[0] ?? "")?.type;
    return type && opaqueMaterialTypes.has(type)
      ? "opaque"
      : type && windowMaterialTypes.has(type)
        ? "window"
        : null;
  });
  const visibleTypes = () =>
    materialTypes.filter(
      (type) =>
        !category() ||
        (category() === "opaque"
          ? opaqueMaterialTypes.has(type[0])
          : windowMaterialTypes.has(type[0])),
    );
  const maxLayers = () => (category() === "window" ? 8 : 10);
  const addLayer = (item: Descriptor) => {
    if (layers().length >= maxLayers()) {
      props.onError(
        `${category() === "window" ? "Window" : "Opaque"} constructions support up to ${maxLayers()} layers.`,
      );
      return;
    }
    setLayers((current) => [...current, item.name]);
    props.clearError();
  };
  const save = async () => {
    if (!name().trim()) {
      props.onError("Construction name is required.");
      return;
    }
    if (!layers().length) {
      props.onError("Add at least one outside layer.");
      return;
    }
    const properties: Record<string, string> = { Name: name().trim() };
    layerKeys.forEach(
      (key, index) => (properties[key] = layers()[index] ?? ""),
    );
    await props.onSave(properties);
  };

  return (
    <div class="flex min-h-0 flex-1 flex-col">
      <EditorIdentityHeader
        eyebrow="Construction"
        title="Construction properties"
        actions={
          <div class="flex gap-2">
            <button
              type="button"
              title="Duplicate"
              class="rounded-xl border border-citadel-blue/25 p-2.5 text-citadel-blue hover:bg-citadel-blue/10"
              onClick={props.onDuplicate}
            >
              <Copy class="size-4" />
            </button>
            <button
              type="button"
              title="Delete"
              class="rounded-xl border border-error/25 p-2.5 text-error hover:bg-error/10"
              onClick={props.onDelete}
            >
              <Trash2 class="size-4" />
            </button>
          </div>
        }
      />
      <div class="mb-5 grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
        <label class="min-w-0">
          <span class="mb-1.5 block text-sm font-semibold text-graphite">
            Construction name
          </span>
          <input
            class="form-input py-2.5"
            value={name()}
            onInput={(event) => setName(event.currentTarget.value)}
          />
        </label>
        <button
          type="button"
          class="inline-flex h-[2.9rem] items-center gap-2 rounded-xl bg-citadel-blue px-5 font-semibold text-cloud-white shadow-lg shadow-citadel-blue/20 hover:bg-citadel-blue/90"
          onClick={() => void save()}
        >
          <Save class="size-4" />{" "}
          <span class="hidden sm:inline">Save construction</span>
          <span class="sm:hidden">Save</span>
        </button>
      </div>
      <div class="grid min-h-0 flex-1 gap-5 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside class="flex min-h-0 min-w-0 flex-col">
          <p class="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-citadel-blue">
            Materials palette
          </p>
          <div class="cozy-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto pr-2">
            <For each={visibleTypes()}>
              {(type) => (
                <div class="overflow-hidden rounded-xl border border-warm-stone/20">
                  <button
                    type="button"
                    class="flex w-full items-center justify-between bg-sky-mist/20 px-3 py-2 text-left text-xs font-semibold text-graphite"
                    onClick={() =>
                      setOpenType((current) =>
                        current === type[0] ? null : type[0],
                      )
                    }
                  >
                    <span>{type[2]}</span>
                    <span>{openType() === type[0] ? "−" : "+"}</span>
                  </button>
                  <Show when={openType() === type[0]}>
                    <div class="space-y-2 p-2">
                      <For
                        each={props.materials.filter(
                          (item) => item.type === type[0],
                        )}
                        fallback={
                          <p class="p-2 text-xs text-graphite/40">
                            No materials.
                          </p>
                        }
                      >
                        {(item) => (
                          <button
                            type="button"
                            title={item.name}
                            class="block w-full rounded-lg border border-warm-stone/20 bg-cloud-white px-3 py-2 text-left shadow-sm hover:border-citadel-blue/45 hover:bg-citadel-blue/8"
                            onClick={() => addLayer(item)}
                          >
                            <span class="block break-words text-xs font-semibold leading-5 text-graphite">
                              {item.name}
                            </span>
                          </button>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>
              )}
            </For>
          </div>
        </aside>
        <div class="flex min-h-0 min-w-0 flex-col">
          <div class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-sky-mist/30 bg-sky-mist/15 p-4">
            <div class="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-3">
              <div>
                <h2 class="font-bold text-graphite">Construction layers</h2>
                <p class="text-xs text-graphite/50">
                  Outside to inside ·{" "}
                  {category()
                    ? `${category()} materials only`
                    : "choose any material type"}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <span class="rounded-full bg-cloud-white px-3 py-1 text-xs font-semibold text-citadel-blue">
                  {layers().length}/{maxLayers()}
                </span>
              </div>
            </div>
            <div class="cozy-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto pr-2">
              <For
                each={layers()}
                fallback={
                  <div class="rounded-xl border border-dashed border-warm-stone/30 bg-cloud-white/60 p-8 text-center text-sm text-graphite/45">
                    No layers added. Choose a material from the palette.
                  </div>
                }
              >
                {(layer, index) => (
                  <div class="flex items-center gap-3 rounded-xl border border-warm-stone/15 bg-cloud-white p-3 shadow-sm">
                    <span class="size-2 shrink-0 rounded-full bg-citadel-blue" />
                    <span class="w-24 shrink-0 text-xs font-bold text-graphite">
                      {index() === 0 ? "Outside Layer" : `Layer ${index() + 1}`}
                    </span>
                    <span
                      title={layer}
                      class="min-w-0 flex-1 break-words border-l border-warm-stone/20 pl-4 text-sm font-semibold text-graphite"
                    >
                      {layer}
                    </span>
                    <button
                      type="button"
                      class="flex size-8 shrink-0 items-center justify-center rounded-full bg-citadel-blue text-cloud-white"
                      onClick={() =>
                        setLayers((current) =>
                          current.filter(
                            (_, itemIndex) => itemIndex !== index(),
                          ),
                        )
                      }
                    >
                      <X class="size-4" />
                    </button>
                  </div>
                )}
              </For>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConstructionManager() {
  const client = useQueryClient();
  const [selectedId, setSelectedId] = createSignal("0");
  const [openType, setOpenType] = createSignal<ConstructionType | null>(
    "CONSTRUCTION",
  );
  const [openLibraryType, setOpenLibraryType] =
    createSignal<ConstructionType | null>("CONSTRUCTION");
  const [displayedData, setDisplayedData] = createSignal<ConstructionState>();
  const [notice, setNotice] = createSignal("");
  const [error, setError] = createSignal("");
  const query = createQuery(() => ({
    queryKey: ["constructions", selectedId()],
    queryFn: () => loadConstructions(selectedId()),
    placeholderData: keepPreviousData,
  }));
  createEffect(() => {
    if (query.data) setDisplayedData(query.data);
  });
  const component = createMemo(() => displayedData()?.component ?? null);
  const refresh = async (id = selectedId()) => {
    setSelectedId(id);
    await client.invalidateQueries({ queryKey: ["constructions"] });
  };
  const run = async (
    action: () => Promise<unknown>,
    success: string,
    nextId?: string,
  ) => {
    setNotice("");
    setError("");
    try {
      await action();
      await refresh(nextId);
      setNotice(success);
    } catch {
      setError(
        "The operation failed. Check the submitted values and try again.",
      );
    }
  };
  const createAction = createMutation(() => ({
    mutationFn: (type: ConstructionType) =>
      run(() => createConstruction(type), "Construction created.", "0"),
  }));
  const duplicateAction = createMutation(() => ({
    mutationFn: (item: ConstructionComponent) =>
      run(
        () => duplicateConstruction(item.id, item.type),
        "Construction duplicated.",
        "0",
      ),
  }));
  const deleteAction = createMutation(() => ({
    mutationFn: (id: string) =>
      run(() => deleteConstruction(id), "Construction deleted.", "0"),
  }));
  const libraryAction = createMutation(() => ({
    mutationFn: (item: Descriptor) =>
      run(
        () => addConstruction(item),
        "Construction added from the library.",
        "0",
      ),
  }));
  const descriptors = (type: ConstructionType) =>
    displayedData()?.componentDescriptions.componentParts.filter(
      (item) => item.type === type,
    ) ?? [];
  const library = (type: ConstructionType) =>
    displayedData()?.libraryDescriptions.componentParts.filter(
      (item) => item.type === type,
    ) ?? [];
  const save = (values: Record<string, string>) => {
    const current = component();
    return current
      ? run(() => updateConstruction(current, values), "Construction saved.")
      : Promise.resolve();
  };

  return (
    <EditorWorkspace>
      <EditorSidebar>
        <p class="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-citadel-blue">
          Construction types
        </p>
        <div class="cozy-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          <For each={constructionTypes}>
            {(type) => (
              <div class="overflow-hidden rounded-xl border border-warm-stone/20">
                <button
                  type="button"
                  class="flex w-full items-center justify-between bg-sky-mist/20 px-3 py-2 text-left text-xs font-semibold text-graphite"
                  onClick={() =>
                    setOpenType((current) =>
                      current === type[0] ? null : type[0],
                    )
                  }
                >
                  <span>{type[1]}</span>
                  <span>{openType() === type[0] ? "−" : "+"}</span>
                </button>
                <Show when={openType() === type[0]}>
                  <div class="space-y-2 p-2">
                    <EditorCreateButton
                      label="New construction"
                      onClick={() => createAction.mutate(type[0])}
                    />
                    <For
                      each={descriptors(type[0])}
                      fallback={
                        <p class="p-2 text-xs text-graphite/40">
                          No constructions.
                        </p>
                      }
                    >
                      {(item) => (
                        <button
                          type="button"
                          title={item.name}
                          class="block w-full min-w-0 overflow-hidden rounded-lg border px-3 py-2 text-left text-xs font-semibold"
                          classList={{
                            "border-citadel-blue bg-citadel-blue/10 text-citadel-blue":
                              selectedId() === item.id,
                            "border-warm-stone/20 text-graphite":
                              selectedId() !== item.id,
                          }}
                          onClick={() => setSelectedId(item.id)}
                        >
                          <span class="block truncate">{item.name}</span>
                        </button>
                      )}
                    </For>
                  </div>
                </Show>
              </div>
            )}
          </For>
        </div>
      </EditorSidebar>
      <EditorMain>
        <EditorNotification message={error() || notice()} error={Boolean(error())} onDismiss={() => { setError(""); setNotice(""); }} />
        <Switch>
          <Match when={query.isPending && !displayedData()}>
            <div class="flex min-h-[28rem] items-center justify-center text-citadel-blue">
              <LoaderCircle class="mr-2 size-5 animate-spin" /> Loading
              constructions…
            </div>
          </Match>
          <Match when={!component()}>
            <EditorEmptyState
              icon={<BrickWall class="size-7" />}
              title="Select or create a construction"
              description="Choose a construction on the left, create a new one, or add one from the EnergyPlus library."
            />
          </Match>
          <Match when={component()}>
            {(current) => (
              <div class="flex h-full min-h-0 flex-col">
                <Show
                  when={current().type === "CONSTRUCTION"}
                  fallback={
                    <div class="min-h-0 flex-1">
                      <StandardConstructionForm
                        component={current()}
                        constructions={
                          displayedData()?.componentDescriptions
                            .componentParts ?? []
                        }
                        onSave={save}
                        onDuplicate={() => duplicateAction.mutate(current())}
                        onDelete={() => deleteAction.mutate(current().id)}
                      />
                    </div>
                  }
                >
                  <LayeredConstructionForm
                    component={current()}
                    materials={
                      displayedData()?.selectableComponentDescriptions
                        .componentParts ?? []
                    }
                    onSave={save}
                    onError={(message) => {
                      setNotice("");
                      setError(message);
                    }}
                    clearError={() => setError("")}
                    onDuplicate={() => duplicateAction.mutate(current())}
                    onDelete={() => deleteAction.mutate(current().id)}
                  />
                </Show>
              </div>
            )}
          </Match>
        </Switch>
      </EditorMain>
      <EditorSidebar>
        <p class="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-citadel-blue">
          <Library class="size-4" /> Constructions library
        </p>
        <div class="cozy-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          <For each={constructionTypes}>
            {(type) => (
              <div class="overflow-hidden rounded-xl border border-warm-stone/20">
                <button
                  type="button"
                  class="flex w-full items-center justify-between bg-sky-mist/20 px-3 py-2 text-left text-xs font-semibold text-graphite"
                  onClick={() =>
                    setOpenLibraryType((current) =>
                      current === type[0] ? null : type[0],
                    )
                  }
                >
                  <span>{type[1]}</span>
                  <span>{openLibraryType() === type[0] ? "−" : "+"}</span>
                </button>
                <Show when={openLibraryType() === type[0]}>
                  <div class="space-y-1 p-2">
                    <For
                      each={library(type[0])}
                      fallback={
                        <p class="p-2 text-xs text-graphite/40">
                          No library items.
                        </p>
                      }
                    >
                      {(item) => (
                        <button
                          type="button"
                          title={item.name}
                          class="block w-full min-w-0 overflow-hidden rounded-lg border border-warm-stone/15 px-3 py-2 text-left hover:bg-citadel-blue/10"
                          onClick={() => libraryAction.mutate(item)}
                        >
                          <span class="block truncate text-xs font-semibold text-graphite">
                            {item.name}
                          </span>
                          <span class="text-[11px] text-citadel-blue">
                            Add to workspace
                          </span>
                        </button>
                      )}
                    </For>
                  </div>
                </Show>
              </div>
            )}
          </For>
        </div>
      </EditorSidebar>
    </EditorWorkspace>
  );
}
