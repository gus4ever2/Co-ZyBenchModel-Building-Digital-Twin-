import { BrickWall, PanelsTopLeft, X } from "lucide-solid";
import { For, Show, createMemo, createSignal } from "solid-js";
import { constructionSetGroups } from "../construction-sets/constructionSetGroups";
import ConstructionSetSlotCard from "../construction-sets/ConstructionSetSlotCard";
import ConstructionAssignmentCard from "../construction-sets/ConstructionAssignmentCard";
import type {
  ComponentSnapshot,
  SimulationListItem,
} from "./simulationsService";

type DiffStatus = "unchanged" | "changed" | "baseline-only" | "compare-only";

type ConstructionSlot = {
  key: string;
  label: string;
  baselineName: string | null;
  comparedName: string | null;
  baseline?: ComponentSnapshot;
  compared?: ComponentSnapshot;
  status: DiffStatus;
};
type ConstructionSide = "baseline" | "compared";

export default function ConstructionSetComparison(props: {
  simulations: SimulationListItem[];
  scrollCardsOnly?: boolean;
}) {
  const scenarios = () => props.simulations.slice(1);
  const [scenarioId, setScenarioId] = createSignal("");
  const scenario = createMemo(
    () =>
      scenarios().find((item) => item.id === scenarioId()) ?? scenarios()[0],
  );
  const baseline = () => props.simulations[0];
  const [activeGroup, setActiveGroup] = createSignal<string>(
    constructionSetGroups[0].id,
  );
  const [activeDropdown, setActiveDropdown] = createSignal<{
    slotKey: string;
    side: ConstructionSide;
  } | null>(null);
  const group = createMemo(
    () =>
      constructionSetGroups.find((item) => item.id === activeGroup()) ??
      constructionSetGroups[0],
  );
  const slots = createMemo(() =>
    constructionSlots(baseline(), scenario(), group().fields),
  );
  const changedCount = (groupId: string) => {
    const selected = constructionSetGroups.find((item) => item.id === groupId);
    return selected
      ? constructionSlots(baseline(), scenario(), selected.fields).filter(
          (slot) => slot.status !== "unchanged",
        ).length
      : 0;
  };

  return (
    <div
      class="min-h-0"
      classList={{
        "flex h-full flex-col gap-4": props.scrollCardsOnly,
        "space-y-6": !props.scrollCardsOnly,
      }}
    >
      <Show
        when={baseline()?.constructionSet}
        fallback={
          <p class="rounded-xl bg-warm-stone/5 p-4 text-sm text-graphite/55">
            This simulation has no stored construction-set snapshot.
          </p>
        }
      >
        <div
          class="gap-5"
          classList={{
            "flex min-h-0 flex-1 flex-col": props.scrollCardsOnly,
            "grid": !props.scrollCardsOnly,
          }}
        >
          <Show when={scenario()}>
            <section
              class="space-y-3"
              classList={{ "shrink-0": props.scrollCardsOnly }}
            >
              <div class="flex items-center gap-2">
                <PanelsTopLeft class="size-4 text-citadel-blue" />
                <h3 class="text-sm font-bold text-graphite">
                  Construction Set
                </h3>
              </div>
              <div class="grid gap-6 md:grid-cols-2">
                <ConstructionSetCard
                  eyebrow="Baseline"
                  simulation={baseline()}
                  snapshot={baseline()?.constructionSet?.constructionSet}
                  constructionCount={baseline()?.constructionSet?.constructions.length ?? 0}
                  materialCount={baseline()?.constructionSet?.materials.length ?? 0}
                />
                <Show when={scenario()}>
                  {(compared) => (
                    <ConstructionSetCard
                      eyebrow="Compared"
                      simulation={compared()}
                      snapshot={compared()?.constructionSet?.constructionSet}
                      constructionCount={compared()?.constructionSet?.constructions.length ?? 0}
                      materialCount={compared()?.constructionSet?.materials.length ?? 0}
                    />
                  )}
                </Show>
              </div>
            </section>
          </Show>

          <section
            class="space-y-3"
            classList={{ "flex min-h-0 flex-1 flex-col": props.scrollCardsOnly }}
          >
            <div class="flex shrink-0 flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <BrickWall class="size-4 text-citadel-blue" />
                <h3 class="text-sm font-bold text-graphite">Constructions</h3>
              </div>
              <Show when={scenarios().length > 1}>
                <label class="flex items-center gap-2 text-xs font-semibold text-graphite/55">
                  Compared simulation
                  <select
                    value={scenario()?.id ?? ""}
                    onChange={(event) =>
                      setScenarioId(event.currentTarget.value)
                    }
                    class="max-w-64 rounded-lg border border-warm-stone/25 bg-cloud-white px-3 py-2 text-xs text-graphite"
                  >
                    <For each={scenarios()}>
                      {(item) => <option value={item.id}>{item.name}</option>}
                    </For>
                  </select>
                </label>
              </Show>
            </div>

            <div
              class="space-y-2"
              classList={{ "flex min-h-0 flex-1 flex-col": props.scrollCardsOnly }}
            >
              <nav
                class="cozy-scrollbar flex shrink-0 gap-1 overflow-x-auto rounded-2xl bg-sky-mist/15 p-2"
                aria-label="Construction categories"
              >
                <For each={constructionSetGroups}>
                  {(item) => (
                    <button
                      type="button"
                      aria-pressed={activeGroup() === item.id}
                      onClick={() => setActiveGroup(item.id)}
                      class="shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition"
                      classList={{
                        "bg-cloud-white text-graphite shadow-sm":
                          activeGroup() === item.id,
                        "text-graphite/55 hover:bg-cloud-white/60":
                          activeGroup() !== item.id,
                      }}
                    >
                      {item.title}
                      <Show when={scenario()}>
                        <span class="ml-2 rounded-full bg-citadel-blue/10 px-1.5 py-0.5 text-[0.6rem] text-citadel-blue">
                          {changedCount(item.id)}
                        </span>
                      </Show>
                    </button>
                  )}
                </For>
              </nav>

              <div
                class="p-4 sm:p-5"
                classList={{ "flex min-h-0 flex-1 flex-col": props.scrollCardsOnly }}
              >
                <div class="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-2">
                  <h4 class="font-bold text-graphite">{group().title}</h4>
                  <span class="rounded-full bg-sky-mist/50 px-2 py-1 text-[0.65rem] font-semibold text-citadel-blue">
                    {scenario()
                      ? `${slots().filter((slot) => slot.status !== "unchanged").length} changed · ${slots().length} slots`
                      : `${slots().filter((slot) => Boolean(slot.baselineName)).length} assigned`}
                  </span>
                </div>
                <div
                  classList={{
                    "cozy-scrollbar min-h-0 flex-1 overflow-y-auto": props.scrollCardsOnly,
                  }}
                >
                  <div class="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  <For each={slots()}>
                    {(slot) => (
                      <ConstructionSetSlotCard label={slot.label}>
                        <div class="space-y-2">
                          <div class="relative">
                            <Show when={scenario()}>
                              <span class="mb-1 flex flex-wrap items-baseline gap-x-1.5 text-[0.58rem] font-bold uppercase tracking-wide text-graphite/45">
                                <span>Baseline</span>
                                <span class="break-words text-[0.62rem] font-semibold normal-case tracking-normal text-graphite/65">
                                  · {baseline()?.constructionSet?.constructionSet.properties.Name ?? baseline()?.constructionSetName ?? baseline()?.constructionSet?.constructionSet.name ?? "Unnamed construction set"}
                                </span>
                              </span>
                            </Show>
                            <ConstructionAssignmentCard
                              name={slot.baselineName ?? "Not assigned"}
                              changed={
                                Boolean(scenario()) &&
                                !sameName(slot.baselineName, slot.comparedName)
                              }
                              expanded={
                                activeDropdown()?.slotKey === slot.key &&
                                activeDropdown()?.side === "baseline"
                              }
                              onClick={() =>
                                setActiveDropdown((active) =>
                                  active?.slotKey === slot.key &&
                                  active.side === "baseline"
                                    ? null
                                    : { slotKey: slot.key, side: "baseline" },
                                )
                              }
                            />
                            <Show
                              when={
                                activeDropdown()?.slotKey === slot.key &&
                                activeDropdown()?.side === "baseline"
                              }
                            >
                              <ConstructionSlotDetails
                                slot={slot}
                                baseline={baseline()!}
                                compared={scenario()}
                                side="baseline"
                              />
                            </Show>
                          </div>
                          <Show when={scenario()}>
                            <div class="relative">
                              <span class="mb-1 flex flex-wrap items-baseline gap-x-1.5 text-[0.58rem] font-bold uppercase tracking-wide text-graphite/45">
                                <span>Compared</span>
                                <span class="break-words text-[0.62rem] font-semibold normal-case tracking-normal text-graphite/65">
                                  · {scenario()?.constructionSet?.constructionSet.properties.Name ?? scenario()?.constructionSetName ?? scenario()?.constructionSet?.constructionSet.name ?? "Unnamed construction set"}
                                </span>
                              </span>
                              <ConstructionAssignmentCard
                                name={slot.comparedName ?? "Not assigned"}
                                changed={
                                  !sameName(
                                    slot.baselineName,
                                    slot.comparedName,
                                  )
                                }
                                expanded={
                                  activeDropdown()?.slotKey === slot.key &&
                                  activeDropdown()?.side === "compared"
                                }
                                onClick={() =>
                                  setActiveDropdown((active) =>
                                    active?.slotKey === slot.key &&
                                    active.side === "compared"
                                      ? null
                                      : { slotKey: slot.key, side: "compared" },
                                  )
                                }
                              />
                              <Show
                                when={
                                  activeDropdown()?.slotKey === slot.key &&
                                  activeDropdown()?.side === "compared"
                                }
                              >
                                <ConstructionSlotDetails
                                  slot={slot}
                                  baseline={baseline()!}
                                  compared={scenario()}
                                  side="compared"
                                />
                              </Show>
                            </div>
                          </Show>
                        </div>
                        <Show when={scenario()}>
                          <div class="mt-2 flex justify-end">
                            <DiffBadge status={slot.status} />
                          </div>
                        </Show>
                      </ConstructionSetSlotCard>
                    )}
                  </For>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </Show>
    </div>
  );
}

function ConstructionSetCard(props: {
  eyebrow: string;
  simulation?: SimulationListItem;
  snapshot?: ComponentSnapshot;
  constructionCount: number;
  materialCount: number;
}) {
  const name = () =>
    props.snapshot?.properties.Name ??
    props.simulation?.constructionSetName ??
    props.snapshot?.name ??
    "Unnamed construction set";
  return (
    <article class="min-w-0 px-1">
      <p class="border-b border-warm-stone/25 pb-2 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-citadel-blue">
        {props.eyebrow}
      </p>
      <p class="mt-3 break-words text-base font-bold leading-6 text-graphite">
        {name()}
      </p>
      <div class="mt-3 flex flex-wrap gap-2 text-center text-xs">
        <SnapshotCount label="Constructions" value={props.constructionCount} />
        <SnapshotCount label="Materials" value={props.materialCount} />
      </div>
    </article>
  );
}
function SnapshotCount(props: { label: string; value: number }) {
  return (
    <div class="min-w-20 rounded-xl border border-citadel-blue/10 bg-cloud-white/75 px-3 py-2">
      <strong class="block text-sm text-graphite">{props.value}</strong>
      <span class="text-[0.62rem] text-graphite/45">{props.label}</span>
    </div>
  );
}
function DiffBadge(props: { status: DiffStatus }) {
  const label = () =>
    ({
      unchanged: "Unchanged",
      changed: "Changed",
      "baseline-only": "Baseline only",
      "compare-only": "Compared only",
    })[props.status];
  return (
    <span
      class="shrink-0 rounded-full px-2 py-1 text-[0.58rem] font-bold"
      classList={{
        "bg-warm-stone/10 text-graphite/45": props.status === "unchanged",
        "bg-red-wine/10 text-red-wine":
          props.status === "changed" || props.status === "baseline-only",
        "bg-citadel-blue/10 text-citadel-blue": props.status === "compare-only",
      }}
    >
      {label()}
    </span>
  );
}

function ConstructionSlotDetails(props: {
  slot: ConstructionSlot;
  baseline: SimulationListItem;
  compared?: SimulationListItem;
  side: ConstructionSide;
}) {
  const [selectedLayer, setSelectedLayer] = createSignal<string | null>(null);
  const baselineMaterials = () =>
    props.baseline.constructionSet?.materials ?? [];
  const comparedMaterials = () =>
    props.compared?.constructionSet?.materials ?? [];
  const layerRows = createMemo(() =>
    constructionLayerRows(props.slot.baseline, props.slot.compared),
  );
  const selected = createMemo(() =>
    layerRows().find((layer) => layer.key === selectedLayer()),
  );
  const materialPair = createMemo(() => {
    const layer = selected();
    if (!layer) return undefined;
    return {
      baseline: findMaterial(baselineMaterials(), layer.baselineName),
      compared: findMaterial(comparedMaterials(), layer.comparedName),
    };
  });
  const materialIsSame = () => {
    const pair = materialPair();
    return Boolean(
      pair?.baseline &&
      pair.compared &&
      sameName(pair.baseline.name, pair.compared.name) &&
      sameProperties(pair.baseline, pair.compared),
    );
  };

  return (
    <div class="absolute left-0 right-0 top-[calc(100%+0.25rem)] z-50 max-h-64 overflow-y-auto rounded-xl border border-warm-stone/25 bg-cloud-white p-2 shadow-2xl">
      <For each={layerRows()}>
        {(layer) => {
          const changed = () => layer.changed;
          const materialName = () =>
            props.side === "baseline" ? layer.baselineName : layer.comparedName;
          return (
            <button
              type="button"
              disabled={!materialName()}
              aria-expanded={selectedLayer() === layer.key}
              onClick={() =>
                setSelectedLayer(
                  selectedLayer() === layer.key ? null : layer.key,
                )
              }
              class="block w-full rounded-lg px-3 py-2.5 text-left transition disabled:cursor-default disabled:opacity-55"
              classList={{
                "bg-red-wine/5 hover:bg-red-wine/10": changed(),
                "hover:bg-sky-mist/20": !changed(),
              }}
            >
              <span
                class="block break-words text-xs font-semibold"
                classList={{
                  "text-red-wine": changed(),
                  "text-graphite": !changed(),
                }}
              >
                {materialName() ?? "No material assigned"}
              </span>
              <span class="mt-0.5 flex items-center justify-between gap-2">
                <span class="text-[0.58rem] uppercase tracking-wide text-citadel-blue">
                  {layer.label} · Material
                </span>
                <Show when={props.compared && changed()}>
                  <span class="text-[0.58rem] font-bold uppercase tracking-wide text-red-wine">
                    Different
                  </span>
                </Show>
              </span>
            </button>
          );
        }}
      </For>

      <Show keyed when={selected() && materialPair()}>
        {(pair) => {
          const layer = selected();
          const same = materialIsSame();
          return (
            <div class="pointer-events-none fixed inset-0 z-[100] grid place-items-center p-4">
              <section
                role="dialog"
                aria-modal="false"
                aria-labelledby="material-inspection-title"
                class="pointer-events-auto flex h-[min(80dvh,48rem)] w-[min(56rem,94vw)] flex-col overflow-hidden rounded-2xl border border-warm-stone/25 bg-cloud-white shadow-2xl"
              >
                <header class="flex shrink-0 items-start justify-between gap-4 border-b border-citadel-blue/10 bg-sky-mist/35 px-5 py-4">
                  <div>
                    <p class="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-citadel-blue">
                      {props.compared
                        ? "Material comparison"
                        : "Material details"}
                    </p>
                    <h2
                      id="material-inspection-title"
                      class="mt-1 text-lg font-bold text-graphite"
                    >
                      {layer?.label ?? "Selected layer"}
                    </h2>
                    <p class="mt-1 text-xs text-graphite/55">
                      {!props.compared
                        ? "Properties from this saved material."
                        : same
                          ? "Both constructions use the same material."
                          : "Compare the materials assigned to this layer."}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Close material details"
                    onClick={() => setSelectedLayer(null)}
                    class="rounded-lg p-1 text-graphite/55 transition hover:bg-cloud-white hover:text-graphite"
                  >
                    <X class="size-5" />
                  </button>
                </header>
                <div
                  class="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden p-4 sm:p-5"
                  classList={{
                    "sm:grid-cols-2": Boolean(props.compared),
                  }}
                >
                  <Show
                    when={Boolean(props.compared)}
                    fallback={
                      <MaterialPropertiesCard
                        title="Material"
                        constructionSetName={props.baseline.constructionSetName}
                        material={pair.baseline ?? pair.compared}
                        other={undefined}
                      />
                    }
                  >
                    <MaterialPropertiesCard
                      title="Baseline material"
                      constructionSetName={props.baseline.constructionSetName}
                      material={pair.baseline}
                      other={pair.compared}
                    />
                    <MaterialPropertiesCard
                      title="Compared material"
                      constructionSetName={props.compared?.constructionSetName}
                      material={pair.compared}
                      other={pair.baseline}
                    />
                  </Show>
                </div>
              </section>
            </div>
          );
        }}
      </Show>
    </div>
  );
}

function MaterialPropertiesCard(props: {
  title: string;
  constructionSetName?: string;
  material?: ComponentSnapshot;
  other?: ComponentSnapshot;
}) {
  const properties = () => {
    const left = props.material?.properties ?? {};
    const right = props.other?.properties ?? {};
    const keys = [
      ...Object.keys(left),
      ...Object.keys(right).filter((key) => !(key in left)),
    ];
    return keys.map((key) => ({
      key,
      value: left[key],
      otherValue: right[key],
      changed:
        Boolean(props.other) && normalize(left[key]) !== normalize(right[key]),
    }));
  };
  return (
    <article class="flex min-h-0 flex-col overflow-hidden rounded-xl border border-warm-stone/20 bg-cloud-white">
      <header class="shrink-0 border-b border-warm-stone/10 bg-sky-mist/20 px-3 py-2">
        <p class="flex flex-wrap items-baseline gap-x-1.5 text-[0.6rem] font-bold uppercase tracking-wide text-citadel-blue">
          <span>{props.title}</span>
          <Show when={props.constructionSetName}>
            <span class="break-words text-[0.62rem] font-semibold normal-case tracking-normal text-graphite/65">
              · {props.constructionSetName}
            </span>
          </Show>
        </p>
        <p class="mt-1 break-words text-xs font-semibold text-graphite">
          {props.material?.name ?? "Material unavailable"}
        </p>
      </header>
      <div class="cozy-scrollbar min-h-0 flex-1 overflow-y-auto divide-y divide-warm-stone/10">
        <For each={properties()}>
          {(property) => (
            <div
              class="grid grid-cols-[minmax(7rem,0.8fr)_minmax(0,1fr)] gap-2 px-3 py-2 text-[0.68rem]"
              classList={{ "bg-red-50": property.changed }}
            >
              <span class="break-words text-graphite/50">
                {propertyLabel(property.key)}
              </span>
              <span
                class="break-words font-semibold"
                classList={{
                  "text-red-wine": property.changed,
                  "text-graphite": !property.changed,
                }}
              >
                {property.value ?? "—"}
              </span>
            </div>
          )}
        </For>
        <Show when={!props.material}>
          <p class="p-3 text-xs text-graphite/50">
            No stored material snapshot was found.
          </p>
        </Show>
      </div>
    </article>
  );
}

function constructionSlots(
  baseline: SimulationListItem | undefined,
  compared: SimulationListItem | undefined,
  fields: ReadonlyArray<readonly [string, string]>,
): ConstructionSlot[] {
  const leftSet = baseline?.constructionSet;
  const rightSet = compared?.constructionSet;
  return fields.map(([field, label]) => {
    const leftName = leftSet?.constructionSet.properties[field]?.trim() || null;
    const rightName =
      rightSet?.constructionSet.properties[field]?.trim() || null;
    const left = leftSet?.constructions.find((item) =>
      sameName(item.name, leftName),
    );
    const right = rightSet?.constructions.find((item) =>
      sameName(item.name, rightName),
    );
    const status: DiffStatus =
      !leftName && !rightName
        ? "unchanged"
        : !leftName
          ? "compare-only"
          : !rightName
            ? "baseline-only"
            : sameName(leftName, rightName) &&
                (!left || !right || sameProperties(left, right))
              ? "unchanged"
              : "changed";
    return {
      key: field,
      label,
      baselineName: leftName,
      comparedName: rightName,
      baseline: left,
      compared: right,
      status,
    };
  });
}

function constructionLayerRows(
  baseline?: ComponentSnapshot,
  compared?: ComponentSnapshot,
) {
  const left = baseline?.properties ?? {};
  const right = compared?.properties ?? {};
  const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])]
    .filter((key) => key !== "Name" && /^(Outside_Layer|Layer_\d+)$/.test(key))
    .sort((a, b) => layerIndex(a) - layerIndex(b));
  return keys.map((key) => ({
    key,
    label: key === "Outside_Layer" ? "Outside layer" : "Layer " + key.slice(6),
    baselineName: left[key] ?? null,
    comparedName: right[key] ?? null,
    changed: Boolean(compared) && !sameName(left[key], right[key]),
  }));
}

function layerIndex(key: string) {
  return key === "Outside_Layer" ? 1 : Number(key.slice(6));
}

function findMaterial(materials: ComponentSnapshot[], name: string | null) {
  return name
    ? materials.find((material) => sameName(material.name, name))
    : undefined;
}

function sameProperties(left: ComponentSnapshot, right: ComponentSnapshot) {
  const leftProperties = left.properties ?? {};
  const rightProperties = right.properties ?? {};
  const keys = new Set([
    ...Object.keys(leftProperties),
    ...Object.keys(rightProperties),
  ]);
  return [...keys].every(
    (key) => normalize(leftProperties[key]) === normalize(rightProperties[key]),
  );
}

function sameName(
  left: string | null | undefined,
  right: string | null | undefined,
) {
  return (
    (left ?? "").trim().toLocaleLowerCase() ===
    (right ?? "").trim().toLocaleLowerCase()
  );
}

function normalize(value: string | null | undefined) {
  return value == null ? "" : String(value).trim();
}

function propertyLabel(key: string) {
  return key.replaceAll("_", " ").replace(/\s+/g, " ").trim();
}
