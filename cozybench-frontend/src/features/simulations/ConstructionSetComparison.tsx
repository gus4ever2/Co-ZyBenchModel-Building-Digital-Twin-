import { BrickWall, ChevronDown, Cuboid, PanelsTopLeft } from "lucide-solid";
import { For, Show, createMemo, createSignal } from "solid-js";
import type {
  ComponentSnapshot,
  SimulationListItem,
} from "./simulationsService";

type SnapshotKind = "set" | "construction" | "material";
type DiffStatus = "unchanged" | "changed" | "baseline-only" | "compare-only";

type SnapshotPair = {
  key: string;
  name: string;
  baseline?: ComponentSnapshot;
  compared?: ComponentSnapshot;
  status: DiffStatus;
};

export default function ConstructionSetComparison(props: {
  simulations: SimulationListItem[];
}) {
  const scenarios = () => props.simulations.slice(1);
  const [scenarioId, setScenarioId] = createSignal("");
  const scenario = createMemo(
    () =>
      scenarios().find((item) => item.id === scenarioId()) ?? scenarios()[0],
  );
  const baseline = () => props.simulations[0];

  return (
    <div class="space-y-5">
      <Show
        when={baseline()?.constructionSet && scenario()?.constructionSet}
        fallback={
          <p class="rounded-xl bg-warm-stone/5 p-4 text-sm text-graphite/55">
            Both simulations need a stored construction-set snapshot before
            their exact configurations can be compared.
          </p>
        }
      >
        <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center">
          <SnapshotIdentity eyebrow="Baseline" simulation={baseline()} />
          <span class="hidden text-center text-xs font-bold uppercase tracking-[0.14em] text-graphite/35 md:block">
            versus
          </span>
          <div>
            <Show when={scenarios().length > 1}>
              <div class="mb-2 flex flex-wrap justify-end gap-2">
                <For each={scenarios()}>
                  {(item) => (
                    <button
                      type="button"
                      aria-pressed={scenario()?.id === item.id}
                      onClick={() => setScenarioId(item.id)}
                      class="rounded-full border px-3 py-1.5 text-[0.68rem] font-semibold transition"
                      classList={{
                        "border-citadel-blue bg-citadel-blue text-cloud-white":
                          scenario()?.id === item.id,
                        "border-warm-stone/25 bg-cloud-white text-graphite/60 hover:border-citadel-blue/45":
                          scenario()?.id !== item.id,
                      }}
                    >
                      {item.name}
                    </button>
                  )}
                </For>
              </div>
            </Show>
            <SnapshotIdentity
              eyebrow="Compared simulation"
              simulation={scenario()}
            />
          </div>
        </div>

        <DiffGroup
          title="Construction set"
          kind="set"
          pairs={pairRootSnapshots(baseline(), scenario())}
        />
        <DiffGroup
          title="Constructions"
          kind="construction"
          pairs={pairSnapshots(
            baseline()?.constructionSet?.constructions ?? [],
            scenario()?.constructionSet?.constructions ?? [],
          )}
        />
        <DiffGroup
          title="Materials"
          kind="material"
          pairs={pairSnapshots(
            baseline()?.constructionSet?.materials ?? [],
            scenario()?.constructionSet?.materials ?? [],
          )}
        />
      </Show>
    </div>
  );
}

function SnapshotIdentity(props: {
  eyebrow: string;
  simulation?: SimulationListItem;
}) {
  return (
    <div class="rounded-xl border border-citadel-blue/10 bg-sky-mist/25 px-4 py-3">
      <p class="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-citadel-blue">
        {props.eyebrow}
      </p>
      <p class="mt-1 truncate text-sm font-bold text-graphite">
        {props.simulation?.name ?? "—"}
      </p>
      <p class="mt-0.5 truncate text-xs text-graphite/50">
        {props.simulation?.constructionSetName ?? "No construction set"}
      </p>
    </div>
  );
}

function DiffGroup(props: {
  title: string;
  kind: SnapshotKind;
  pairs: SnapshotPair[];
}) {
  const [changedOnly, setChangedOnly] = createSignal(true);
  const visible = createMemo(() =>
    changedOnly()
      ? props.pairs.filter((pair) => pair.status !== "unchanged")
      : props.pairs,
  );
  const changedCount = () =>
    props.pairs.filter((pair) => pair.status !== "unchanged").length;

  return (
    <section>
      <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <h3 class="text-sm font-bold text-graphite">{props.title}</h3>
          <span class="rounded-full bg-sky-mist/50 px-2 py-1 text-[0.62rem] font-bold text-citadel-blue">
            {changedCount()} changed · {props.pairs.length} total
          </span>
        </div>
        <button
          type="button"
          onClick={() => setChangedOnly((value) => !value)}
          class="text-[0.68rem] font-semibold text-citadel-blue hover:underline"
        >
          {changedOnly() ? "Show all" : "Show differences only"}
        </button>
      </div>
      <Show
        when={visible().length > 0}
        fallback={
          <p class="rounded-xl border border-warm-stone/15 bg-warm-stone/5 px-4 py-3 text-xs text-graphite/50">
            No differences in this section.
          </p>
        }
      >
        <div class="space-y-2">
          <For each={visible()}>
            {(pair) => <DiffCard pair={pair} kind={props.kind} />}
          </For>
        </div>
      </Show>
    </section>
  );
}

function DiffCard(props: { pair: SnapshotPair; kind: SnapshotKind }) {
  const [open, setOpen] = createSignal(false);
  const rows = () => propertyRows(props.pair.baseline, props.pair.compared);
  return (
    <article class="overflow-hidden rounded-xl border border-warm-stone/20 bg-cloud-white">
      <button
        type="button"
        aria-expanded={open()}
        onClick={() => setOpen((value) => !value)}
        class="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-sky-mist/15"
      >
        <SnapshotIcon kind={props.kind} />
        <span class="min-w-0 flex-1">
          <strong class="block truncate text-xs text-graphite">
            {props.pair.name}
          </strong>
          <span class="mt-0.5 block text-[0.62rem] uppercase tracking-wide text-graphite/40">
            {props.pair.baseline?.type ?? props.pair.compared?.type}
          </span>
        </span>
        <DiffBadge status={props.pair.status} />
        <ChevronDown
          class="size-4 shrink-0 text-graphite/40 transition-transform"
          classList={{ "rotate-180": open() }}
        />
      </button>
      <Show when={open()}>
        <div class="border-t border-warm-stone/15">
          <div class="grid grid-cols-[minmax(8rem,0.8fr)_minmax(0,1fr)_minmax(0,1fr)] bg-sky-mist/20 text-[0.62rem] font-bold uppercase tracking-wide text-graphite/45">
            <div class="p-3">Property</div>
            <div class="border-l border-warm-stone/10 p-3">Baseline</div>
            <div class="border-l border-warm-stone/10 p-3">Compared</div>
          </div>
          <For each={rows()}>
            {(row) => (
              <div
                class="grid grid-cols-[minmax(8rem,0.8fr)_minmax(0,1fr)_minmax(0,1fr)] border-t border-warm-stone/10 text-[0.7rem]"
                classList={{ "bg-amber-50/55": row.changed }}
              >
                <div class="break-words p-3 text-graphite/50">{row.key}</div>
                <div class="break-words border-l border-warm-stone/10 p-3 font-semibold text-graphite/75">
                  {row.baseline ?? "—"}
                </div>
                <div class="break-words border-l border-warm-stone/10 p-3 font-semibold text-graphite/75">
                  {row.compared ?? "—"}
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </article>
  );
}

function SnapshotIcon(props: { kind: SnapshotKind }) {
  return (
    <span class="grid size-8 shrink-0 place-items-center rounded-lg bg-sky-mist/45 text-citadel-blue [&>svg]:size-4">
      <Show
        when={props.kind === "construction"}
        fallback={
          <Show when={props.kind === "material"} fallback={<PanelsTopLeft />}>
            <Cuboid />
          </Show>
        }
      >
        <BrickWall />
      </Show>
    </span>
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
      class="shrink-0 rounded-full px-2 py-1 text-[0.6rem] font-bold"
      classList={{
        "bg-warm-stone/10 text-graphite/45": props.status === "unchanged",
        "bg-amber-100 text-amber-800": props.status === "changed",
        "bg-red-50 text-red-wine": props.status === "baseline-only",
        "bg-emerald-50 text-emerald-700": props.status === "compare-only",
      }}
    >
      {label()}
    </span>
  );
}

function pairRootSnapshots(
  baseline?: SimulationListItem,
  compared?: SimulationListItem,
) {
  const left = baseline?.constructionSet?.constructionSet;
  const right = compared?.constructionSet?.constructionSet;
  return left || right ? [makePair("construction-set", left, right)] : [];
}

function pairSnapshots(
  baseline: ComponentSnapshot[],
  compared: ComponentSnapshot[],
) {
  const left = new Map(baseline.map((item) => [componentKey(item), item]));
  const right = new Map(compared.map((item) => [componentKey(item), item]));
  const keys = [
    ...left.keys(),
    ...[...right.keys()].filter((key) => !left.has(key)),
  ];
  return keys.map((key) => makePair(key, left.get(key), right.get(key)));
}

function makePair(
  key: string,
  baseline?: ComponentSnapshot,
  compared?: ComponentSnapshot,
): SnapshotPair {
  const status: DiffStatus = !baseline
    ? "compare-only"
    : !compared
      ? "baseline-only"
      : sameProperties(baseline, compared)
        ? "unchanged"
        : "changed";
  return {
    key,
    name: baseline?.name ?? compared?.name ?? "Unnamed component",
    baseline,
    compared,
    status,
  };
}

function componentKey(component: ComponentSnapshot) {
  return `${component.type}::${component.name}`.trim().toLocaleLowerCase();
}

function sameProperties(left: ComponentSnapshot, right: ComponentSnapshot) {
  const leftEntries = Object.entries(left.properties ?? {});
  const rightEntries = Object.entries(right.properties ?? {});
  if (leftEntries.length !== rightEntries.length) return false;
  return leftEntries.every(
    ([key, value]) => normalize(value) === normalize(right.properties?.[key]),
  );
}

function propertyRows(
  baseline?: ComponentSnapshot,
  compared?: ComponentSnapshot,
) {
  const left = baseline?.properties ?? {};
  const right = compared?.properties ?? {};
  const keys = orderedPropertyKeys(
    left,
    right,
    baseline?.type ?? compared?.type,
  );
  return keys.map((key) => ({
    key,
    baseline: left[key],
    compared: right[key],
    changed: normalize(left[key]) !== normalize(right[key]),
  }));
}

function orderedPropertyKeys(
  left: Record<string, string | null>,
  right: Record<string, string | null>,
  type?: string,
) {
  const insertionOrder = [
    ...Object.keys(left),
    ...Object.keys(right).filter((key) => !(key in left)),
  ];
  if (type !== "CONSTRUCTION") return insertionOrder;

  const layerOrder = [
    "Name",
    "Outside_Layer",
    ...Array.from({ length: 9 }, (_, index) => `Layer_${index + 2}`),
  ];
  const position = new Map(layerOrder.map((key, index) => [key, index]));
  return insertionOrder.sort(
    (a, b) =>
      (position.get(a) ?? Number.MAX_SAFE_INTEGER) -
      (position.get(b) ?? Number.MAX_SAFE_INTEGER),
  );
}

function normalize(value: string | null | undefined) {
  return value == null ? "" : String(value).trim();
}
