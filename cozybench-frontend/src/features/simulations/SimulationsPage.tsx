import { createMutation, createQuery } from "@tanstack/solid-query";
import axios from "axios";
import type { EChartsOption } from "echarts";
import {
  Check,
  BrickWall,
  ChevronDown,
  Cuboid,
  CalendarDays,
  Eye,
  Gauge,
  GitCompareArrows,
  Leaf,
  LoaderCircle,
  MapPin,
  PanelsTopLeft,
  Wind,
  X,
} from "lucide-solid";
import {For, Show, createMemo, createSignal, Switch, Match, lazy, onMount} from "solid-js";
import { Portal } from "solid-js/web";
const PlantModelDialog = lazy(() => import("../plant-dt/PlantModelDialog"));
import EChart from "../../components/charts/EChart";
import ComponentPropertiesPanel from "../../components/data-display/ComponentPropertiesPanel";
import ConstructionSetComparison from "./ConstructionSetComparison";
import EditorIdentityHeader from "../../components/form/EditorIdentityHeader";
import WorkspaceHeader from "../../components/layout/WorkspaceHeader";
import { constructionSetGroups } from "../construction-sets/constructionSetGroups";
import { constructionIddMetadata } from "../constructions/constructionIddMetadata";
import { materialIddMetadata } from "../materials/materialIddMetadata.generated";
import {
  timestampLabel,
  zoneWindowOpeningPercent,
} from "./simulationAnalytics";
import {
  loadSimulationResults,
  loadSimulationComparison,
  loadUserSimulations,
  type ComparisonPlantConfiguration,
  type ScenarioComparison,
  type SimulationListItem,
  type SimulationComparisonResponse,
  type SimulationReference,
  type ComponentSnapshot,
  type SimulationTimestep,
  type ThermalZoneComparison,
  type AnalyticsResponse,
} from "./simulationsService";

type ComparedSimulation = {
  simulation: SimulationListItem;
  timesteps: SimulationTimestep[];
  analytics: AnalyticsResponse;
};

type ComparisonBundle = {
  compared: ComparedSimulation[];
  analysis: SimulationComparisonResponse;
};

const colors = [
  "#3C6F8F",
  "#641D16",
  "#4D4936",
  "#8B7D73",
  "#2F7A65",
  "#7A4D8D",
];

export default function SimulationsPage() {
  const [selectedIds, setSelectedIds] = createSignal<string[]>([]);
  const [inspectedId, setInspectedId] = createSignal<string | null>(null);
  const [previewPlantId, setPreviewPlantId] = createSignal("");
  const [comparisonOpen, setComparisonOpen] = createSignal(false);

  const simulations = createQuery(() => ({
    queryKey: ["simulations", "all"],
    queryFn: loadUserSimulations,
  }));
  const completed = createMemo(() =>
    (simulations.data ?? []).filter(
      (simulation) =>
        simulation.status === "COMPLETED" && simulation.timestepCount > 0,
    ),
  );
  const inspectedSimulation = createMemo(() =>
    completed().find((simulation) => simulation.id === inspectedId()),
  );
  const compare = createMutation(() => ({
    mutationFn: async (ids: string[]): Promise<ComparisonBundle> => {
      const analysis = await loadSimulationComparison(ids);
      const compared: ComparedSimulation[] = [];
      for (const id of ids) {
        compared.push({
          simulation: completed().find((item) => item.id === id)!,
          timesteps: (await loadSimulationResults(id)).timesteps,
          analytics: analysis.analyticsBySimulation[id],
        });
      }
      return { compared, analysis };
    },
    onSuccess: () => setComparisonOpen(true),
  }));

  const toggle = (id: string) =>
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : current.length < 6
          ? [...current, id]
          : current,
    );

  return (
    <section
      class="mx-auto flex h-[calc(100vh-10rem)] min-h-0 w-full flex-col gap-4 transition-[max-width] lg:h-[calc(100vh-4rem)]"
      classList={{
        "max-w-[90rem]": comparisonOpen(),
        "max-w-7xl": !comparisonOpen(),
      }}
    >
      <WorkspaceHeader
        eyebrow={
          comparisonOpen()
              ? "Simulation results"
              : "Simulation analytics"
        }
        title={
          comparisonOpen()
              ? "Comparison results"
              : "Compare simulations"
        }
        onBack={
          comparisonOpen()
              ? () => setComparisonOpen(false)
              : undefined
        }
      />

      <main class="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.8rem] border border-warm-stone/25 bg-cloud-white shadow-xl">
        <header class="shrink-0 px-5 pt-5 sm:px-8 sm:pt-8">
          <EditorIdentityHeader
            eyebrow="Simulation comparison"
            title="Select simulation results"
            actions={
              <button
                type="button"
                disabled={selectedIds().length < 2 || compare.isPending}
                onClick={() => compare.mutate(selectedIds())}
                class="flex items-center gap-2 rounded-xl bg-citadel-blue px-5 py-3 text-sm font-bold text-cloud-white shadow-lg shadow-citadel-blue/15 disabled:opacity-40"
              >
                <Show
                  when={!compare.isPending}
                  fallback={<LoaderCircle class="size-4 animate-spin" />}
                >
                  <GitCompareArrows class="size-4" />
                </Show>
                Compare {selectedIds().length || ""}
              </button>
            }
          />
          <p class="pb-5 text-sm text-graphite/55">
            Select between two and six completed simulations. The first
            selection is the baseline.
          </p>
        </header>
        <div class="cozy-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-8 sm:pb-8">
          <Show when={compare.isError}>
            <p role="alert" class="mb-4 rounded-xl bg-red-wine/5 p-4 text-sm text-red-wine">
              {(() => {
                const error = compare.error;
                if (axios.isAxiosError(error)) {
                  const data = error.response?.data;
                  return data?.detail ?? data?.message ?? data?.title ??
                    `Comparison failed${error.response ? ` (HTTP ${error.response.status})` : ""}: ${error.message}`;
                }
                return error instanceof Error ? error.message : "Comparison could not be loaded.";
              })()}
            </p>
          </Show>
          <Show
            when={!simulations.isPending}
            fallback={<Loading label="Loading simulations" />}
          >
            <Show
              when={!simulations.isError}
              fallback={
                <p class="rounded-xl bg-red-wine/5 p-4 text-sm text-red-wine">
                  Simulations could not be loaded from Spring.
                </p>
              }
            >
              <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <For each={completed()}>
                  {(simulation) => (
                    <div
                      role="button"
                      tabindex="0"
                      aria-pressed={selectedIds().includes(simulation.id)}
                      onClick={() => toggle(simulation.id)}
                      onKeyDown={(event) => {
                        if (event.currentTarget !== event.target) return;
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          toggle(simulation.id);
                        }
                      }}
                      class="relative w-full cursor-pointer overflow-hidden rounded-2xl border text-left focus:outline-none focus:ring-2 focus:ring-citadel-blue/30"
                      classList={{
                        "border-citadel-blue bg-sky-mist/25 ring-2 ring-citadel-blue/10":
                          selectedIds().includes(simulation.id),
                        "border-warm-stone/20 bg-cloud-white hover:border-citadel-blue/40":
                          !selectedIds().includes(simulation.id),
                      }}
                    >
                      <Show when={selectedIds().includes(simulation.id)}>
                        <span class="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-citadel-blue px-2 py-1 text-[0.65rem] font-bold text-cloud-white">
                          <Check class="size-3" />
                          {selectedIds()[0] === simulation.id
                            ? "Baseline"
                            : `#${selectedIds().indexOf(simulation.id) + 1}`}
                        </span>
                      </Show>
                      <div class="border-b border-citadel-blue/10 bg-sky-mist/35 px-4 py-4">
                        <p
                          class="truncate pr-20 font-bold text-graphite"
                          title={simulationTitle(simulation)}
                        >
                          {simulationTitle(simulation)}
                        </p>
                        <div class="mt-1.5 flex min-w-0 items-center gap-2 text-[0.7rem] text-graphite/55">
                          <CalendarDays class="size-3.5 shrink-0 text-citadel-blue" />
                          <span
                            class="truncate"
                            title={simulationDate(simulation)}
                          >
                            {simulationDate(simulation)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span class="shrink-0 font-semibold">
                            {statusLabel(simulation.status)}
                          </span>
                        </div>
                      </div>
                      <div class="space-y-2 px-4 py-4 text-xs text-graphite/60">
                        <SimulationCardRow
                          icon={<MapPin />}
                          label={cityLabel(simulation.city)}
                        />
                        <button
                          type="button"
                          aria-expanded={inspectedId() === simulation.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            setInspectedId((current) =>
                              current === simulation.id ? null : simulation.id,
                            );
                          }}
                          title={`Construction snapshot: ${simulation.constructionSetName || "Not specified"}`}
                          class="group w-full rounded-xl border border-warm-stone/15 bg-warm-stone/5 p-3 text-left transition hover:border-citadel-blue/35 hover:bg-sky-mist/25"
                        >
                          <div class="flex min-w-0 items-start gap-2.5">
                            <PanelsTopLeft class="mt-0.5 size-4 shrink-0 text-citadel-blue" />
                            <div class="min-w-0 flex-1">
                              <p class="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-graphite/45">
                                Construction snapshot
                              </p>
                              <p class="mt-1 truncate font-semibold text-graphite/75">
                                {simulation.constructionSetName ||
                                  "Not specified"}
                              </p>
                              <p class="mt-0.5 text-[0.65rem] leading-relaxed text-graphite/45">
                                Configuration stored with this simulation
                              </p>
                            </div>
                            <span class="ml-auto grid size-8 shrink-0 place-items-center self-center rounded-full bg-sky-mist/55 text-citadel-blue transition group-hover:bg-citadel-blue group-hover:text-cloud-white">
                              <Eye class="size-4" />
                            </span>
                          </div>
                        </button>
                        <Show when={simulation.plantSimulation?.plantId}
                          fallback={<SimulationCardRow icon={<Leaf />} label={plantLabel(simulation)} muted={!simulation.plantSimulation} />}>
                          {plantId => (
                            <button type="button" aria-label={`View plant model for ${simulation.name}`}
                              onClick={event => { event.stopPropagation(); setPreviewPlantId(plantId()); }}
                              title={`Plant model: ${plantLabel(simulation)}`}
                              class="group flex w-full items-start gap-2.5 rounded-xl border border-warm-stone/15 bg-warm-stone/5 p-3 text-left transition hover:border-citadel-blue/35 hover:bg-sky-mist/25">
                              <Leaf class="mt-0.5 size-4 shrink-0 text-citadel-blue" />
                              <span class="min-w-0 flex-1">
                                <span class="block text-[0.62rem] font-bold uppercase tracking-[0.14em] text-graphite/45">Plant model</span>
                                <span class="mt-1 block truncate font-semibold text-graphite/75">{plantLabel(simulation)}</span>
                                <span class="mt-0.5 block text-[0.65rem] leading-relaxed text-graphite/45">Plant configuration used in this simulation</span>
                              </span>
                              <span class="grid size-8 shrink-0 place-items-center self-center rounded-full bg-sky-mist/55 text-citadel-blue transition group-hover:bg-citadel-blue group-hover:text-cloud-white"><Eye class="size-4" /></span>
                            </button>
                          )}
                        </Show>
                        <SimulationCardRow
                          icon={<Wind />}
                          label={windowsLabel(simulation)}
                          muted={!simulation.openWindows}
                        />
                        <SimulationCardRow
                          icon={<Gauge />}
                          label={co2ControlLabel(simulation)}
                          muted={!simulation.co2Control}
                        />
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </Show>
        </div>

        <Show when={inspectedSimulation()} keyed>
          {(simulation) => (
            <ConstructionSnapshotDialog simulation={simulation} onClose={() => setInspectedId(null)} />
          )}
        </Show>
        <Show when={previewPlantId()}>
          {id => <PlantModelDialog plantId={id()} onClose={() => setPreviewPlantId("")} />}
        </Show>
        <Show when={comparisonOpen() && compare.data?.compared.length}>
          <div class="absolute inset-0 z-30 bg-cloud-white">
            <ComparisonResults
              compared={compare.data?.compared ?? []}
              analysis={compare.data!.analysis}
            />
          </div>
        </Show>
      </main>
    </section>
  );
}

export function ConstructionSnapshotDialog(props: { simulation: SimulationListItem; onClose: () => void }) {
  let dialog!: HTMLDialogElement;
  onMount(() => dialog.showModal());
  return (
    <Portal>
      <dialog ref={dialog} aria-label="Construction set snapshot" onClose={props.onClose}
        onClick={event => { if (event.target === dialog) props.onClose(); }}
        class="m-auto h-[min(54rem,90dvh)] w-[min(72rem,94vw)] max-w-none overflow-hidden rounded-3xl border border-warm-stone/20 bg-cloud-white p-0 shadow-2xl backdrop:bg-black/50">
        <div class="relative flex h-full min-h-0 flex-col pt-12">
          <button type="button" aria-label="Close construction snapshot" onClick={props.onClose}
            class="absolute right-4 top-3 rounded-lg p-1 text-graphite/55 hover:bg-sky-mist/30">
            <X class="size-5" />
          </button>
          <div class="min-h-0 flex-1 overflow-hidden">
            <ConstructionSnapshotInspector simulation={props.simulation} />
          </div>
        </div>
      </dialog>
    </Portal>
  );
}

export function ConstructionSnapshotInspector(props: {
  simulation: SimulationListItem;
}) {
  const snapshot = () => props.simulation.constructionSet;

  return (
    <section class="flex h-full min-h-0 flex-col overflow-hidden bg-cloud-white">
      <header class="flex flex-wrap items-center justify-between gap-3 border-b border-citadel-blue/10 bg-sky-mist/35 px-5 py-4">
        <div>
          <p class="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-citadel-blue">
            Construction snapshot
          </p>
          <h2 class="mt-1 font-bold text-graphite">
            {props.simulation.constructionSetName || "Unnamed construction set"}
          </h2>
          <p class="mt-1 text-xs text-graphite/50">
            Exact construction configuration stored with{" "}
            {simulationTitle(props.simulation)}.
          </p>
        </div>
        <Show when={snapshot()}>
          <div class="flex gap-2 text-center text-xs">
            <SnapshotCount
              label="Constructions"
              value={snapshot()?.constructions.length ?? 0}
            />
            <SnapshotCount
              label="Materials"
              value={snapshot()?.materials.length ?? 0}
            />
          </div>
        </Show>
      </header>

      <Show
        when={snapshot()}
        fallback={
          <p class="px-5 py-6 text-sm text-graphite/50">
            No construction snapshot is available for this simulation.
          </p>
        }
      >
        {(storedSnapshot) => (
          <div class="cozy-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
            <SnapshotGroup
              title="Construction set"
              components={[storedSnapshot().constructionSet]}
              icon="set"
            />
            <SnapshotGroup
              title="Constructions"
              components={storedSnapshot().constructions}
              icon="construction"
            />
            <SnapshotGroup
              title="Materials"
              components={storedSnapshot().materials}
              icon="material"
            />
          </div>
        )}
      </Show>
    </section>
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

function SnapshotGroup(props: {
  title: string;
  components: ComponentSnapshot[];
  icon: "set" | "construction" | "material";
}) {
  const [openComponentId, setOpenComponentId] = createSignal<string | null>(
    null,
  );
  return (
    <section>
      <div class="mb-2 flex items-center justify-between">
        <h3 class="text-sm font-bold text-graphite">{props.title}</h3>
        <span class="rounded-full bg-sky-mist/45 px-2 py-1 text-[0.62rem] font-bold text-citadel-blue">
          {props.components.length}
        </span>
      </div>
      <div class="grid gap-2 lg:grid-cols-2">
        <For each={props.components}>
          {(component) => (
            <SnapshotComponent
              component={component}
              icon={props.icon}
              open={openComponentId() === component.id}
              onToggle={() =>
                setOpenComponentId((current) =>
                  current === component.id ? null : component.id,
                )
              }
            />
          )}
        </For>
      </div>
    </section>
  );
}

function SnapshotComponent(props: {
  component: ComponentSnapshot;
  icon: "set" | "construction" | "material";
  open: boolean;
  onToggle: () => void;
}) {
  const properties = () => snapshotPropertyEntries(props.component);
  return (
    <article class="relative">
      <button
        type="button"
        aria-expanded={props.open}
        onClick={props.onToggle}
        class="flex w-full items-center gap-3 rounded-xl border border-warm-stone/15 bg-warm-stone/5 px-3 py-3 text-left transition hover:border-citadel-blue/30 hover:bg-sky-mist/15"
        classList={{ "border-citadel-blue/25 bg-sky-mist/20": props.open }}
      >
        <Switch>
          <Match when={props.icon === "construction"}>
            <BrickWall class="size-4 shrink-0 text-citadel-blue" />
          </Match>

          <Match when={props.icon === "material"}>
            <Cuboid class="size-4 shrink-0 text-citadel-blue" />
          </Match>

          <Match when={props.icon === "set"}>
            <PanelsTopLeft class="size-4 shrink-0 text-citadel-blue" />
          </Match>
        </Switch>

        <span class="min-w-0 flex-1">
          <strong class="block truncate text-xs text-graphite">
            {props.component.name}
          </strong>
          <span class="block truncate text-[0.62rem] text-graphite/45">
            {props.component.type}
          </span>
        </span>
        <ChevronDown
          class="size-4 shrink-0 text-graphite/40 transition-transform"
          classList={{ "rotate-180": props.open }}
        />
      </button>

      <ComponentPropertiesPanel open={props.open} properties={properties()} />
    </article>
  );
}

const constructionLayerOrder = [
  "Name",
  "Outside_Layer",
  ...Array.from({ length: 9 }, (_, index) => `Layer_${index + 2}`),
];

const constructionSetPropertyOrder = [
  "Name",
  ...constructionSetGroups.flatMap((group) =>
    group.fields.map(([property]) => property),
  ),
];

function snapshotPropertyEntries(component: ComponentSnapshot) {
  const entries = Object.entries(component.properties ?? {});
  if (entries.length === 0 || entries[0][0] === "Name") return entries;

  const materialMetadata = materialIddMetadata as Record<
    string,
    Record<string, unknown> | undefined
  >;
  const order =
    component.type === "CONSTRUCTION"
      ? constructionLayerOrder
      : constructionIddMetadata[component.type]
        ? Object.keys(constructionIddMetadata[component.type])
        : materialMetadata[component.type]
          ? Object.keys(materialMetadata[component.type] ?? {})
          : component.type.includes("CONSTRUCTION_SET")
            ? constructionSetPropertyOrder
            : ["Name"];
  const position = new Map(order.map((key, index) => [key, index]));

  return entries.sort(([left], [right]) => {
    const leftPosition = position.get(left) ?? Number.MAX_SAFE_INTEGER;
    const rightPosition = position.get(right) ?? Number.MAX_SAFE_INTEGER;
    if (leftPosition !== rightPosition) return leftPosition - rightPosition;
    return left.localeCompare(right, undefined, { numeric: true });
  });
}

function ComparisonResults(props: {
  compared: ComparedSimulation[];
  analysis: SimulationComparisonResponse;
}) {
  const [selectedThermalZone, setSelectedThermalZone] = createSignal("");
  const thermalZones = createMemo(() => {
    const names = new Set<string>();
    props.analysis.comparisons.forEach((comparison) =>
      comparison.thermalZones.forEach((zone) => names.add(zone.zoneName)),
    );
    return [...names].sort((left, right) => left.localeCompare(right));
  });
  const activeThermalZone = createMemo(() => {
    const availableZones = thermalZones();
    return availableZones.includes(selectedThermalZone())
      ? selectedThermalZone()
      : (availableZones[0] ?? "");
  });
  const activeZoneComparisons = createMemo(() =>
    props.analysis.comparisons.flatMap((comparison) => {
      const zone = comparison.thermalZones.find(
        (candidate) => candidate.zoneName === activeThermalZone(),
      );
      return zone ? [{ comparison, zone }] : [];
    }),
  );
  const zonesWithWindows = createMemo(() => {
    const names = new Set<string>();
    props.compared.forEach((item) =>
      item.timesteps.forEach((timestep) =>
        Object.entries(timestep.results?.window_opening_results ?? {}).forEach(
          ([key, result]) => names.add(result.zone_name || key),
        ),
      ),
    );
    return [...names].sort((left, right) => left.localeCompare(right));
  });

  return (
    <section class="flex h-full min-h-0 flex-col p-5 sm:p-6">
      <div class="shrink-0">
        <EditorIdentityHeader
          eyebrow="Comparison results"
          title="Heating, cooling and indoor air quality"
        />
      </div>

      <div class="grid min-h-0 flex-1 gap-4 lg:grid-cols-[21rem_minmax(0,1fr)]">
        <aside class="cozy-scrollbar min-h-0 overflow-y-auto rounded-2xl border border-warm-stone/20 bg-sky-mist/12 p-3">
          <p class="mb-3 px-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-citadel-blue">
            Compared simulations
          </p>
          <div class="space-y-3">
            <For each={props.compared}>
              {(item, index) => (
                <ComparisonSimulationCard
                  item={item}
                  index={index() + 1}
                  baseline={index() === 0}
                />
              )}
            </For>
          </div>
        </aside>

        <div class="cozy-scrollbar min-h-0 space-y-3 overflow-y-auto pr-1">
          <section class="rounded-2xl border border-warm-stone/20 bg-cloud-white p-4">
            <div class="mb-3">
              <h2 class="text-sm font-bold text-graphite">Thermal zone</h2>
              <p class="mt-1 text-xs text-graphite/50">
                Select one zone for the CO₂, temperature, humidity, and construction comparisons.
              </p>
            </div>
            <div class="flex flex-wrap gap-2" aria-label="Select thermal zone">
              <For each={thermalZones()}>
                {(zone) => (
                  <button
                    type="button"
                    aria-pressed={activeThermalZone() === zone}
                    onClick={() => setSelectedThermalZone(zone)}
                    class="rounded-full border px-3 py-2 text-xs font-semibold transition"
                    classList={{
                      "border-citadel-blue bg-citadel-blue text-cloud-white shadow-sm":
                        activeThermalZone() === zone,
                      "border-warm-stone/25 bg-cloud-white text-graphite/65 hover:border-citadel-blue/45 hover:bg-sky-mist/25":
                        activeThermalZone() !== zone,
                    }}
                  >
                    {zone}
                  </button>
                )}
              </For>
            </div>
          </section>

          <ComparisonSection
            title="Energy consumption"
            description="Absolute values and heating/cooling consumption across time."
          >
            <EnergyTotals compared={props.compared} />
            <div class="mt-4 space-y-4">
              <Chart title="Heating consumption">
                <EChart
                  option={meterOption(props.compared, "heating_electricity_j")}
                />
              </Chart>
              <Chart title="Cooling consumption">
                <EChart
                  option={meterOption(props.compared, "cooling_electricity_j")}
                />
              </Chart>
              <Chart title="Total HVAC consumption">
                <EChart
                  option={meterOption(props.compared, "hvac_electricity_j")}
                />
              </Chart>
            </div>
          </ComparisonSection>

          <ComparisonSection
            title="CO₂ concentration by thermal zone"
            description="Select one thermal zone to inspect its CO₂ concentration in ppm."
          >
            <Show when={activeThermalZone()} keyed>
              {(zone) => (
                <div class="space-y-5">
                  <Chart title={`${zone} · CO₂ concentration`}>
                    <EChart
                      option={zoneCo2Option(props.compared, zone)}
                      class="h-[26rem] w-full sm:h-[30rem]"
                    />
                  </Chart>

                  <section>
                    <div class="mb-3">
                      <h3 class="font-bold text-graphite">
                        ΔCO₂ against the baseline
                      </h3>
                      <p class="mt-1 text-xs text-graphite/50">
                        All compared simulations share one chart. Positive
                        values mean that the baseline has the higher CO₂
                        concentration.
                      </p>
                    </div>
                    <Show when={activeZoneComparisons().length > 0}>
                      <Chart title={`${zone} · ΔCO₂ comparison`}>
                        <EChart
                          option={deltaCo2Option(
                            props.analysis.baseline,
                            activeZoneComparisons(),
                            props.analysis.plantConfigurations,
                          )}
                          class="h-[26rem] w-full sm:h-[30rem]"
                        />
                      </Chart>
                    </Show>
                  </section>

                  <section>
                    <div class="mb-3">
                      <h3 class="font-bold text-graphite">Summary</h3>
                      <p class="mt-1 text-xs text-graphite/50">
                        Compare every plant scenario side by side against the
                        first selected baseline.
                      </p>
                    </div>
                    <Co2SummaryComparisonView
                      baseline={props.analysis.baseline}
                      comparisons={activeZoneComparisons()}
                      comparedSimulations={props.compared}
                      plantConfigurations={props.analysis.plantConfigurations}
                      analysisRange={props.analysis.analysisRange}
                    />
                  </section>
                </div>
              )}
            </Show>
          </ComparisonSection>

          <ComparisonSection
            title="Temperature by thermal zone"
            description="Zone air temperature over time, with summary statistics and difference from the baseline."
          >
            <Show when={activeThermalZone()} keyed>
              {(zone) => (
                <ThermalZoneMetricComparisonView
                  compared={props.compared}
                  baseline={props.analysis.baseline}
                  zone={zone}
                  metric="temperature"
                />
              )}
            </Show>
          </ComparisonSection>

          <ComparisonSection
            title="Humidity by thermal zone"
            description="Zone relative humidity over time, with summary statistics and difference from the baseline."
          >
            <Show when={activeThermalZone()} keyed>
              {(zone) => (
                <ThermalZoneMetricComparisonView
                  compared={props.compared}
                  baseline={props.analysis.baseline}
                  zone={zone}
                  metric="humidity"
                />
              )}
            </Show>
          </ComparisonSection>

          <ComparisonSection
            title="Ventilation / outdoor-air control"
            description="Actual outdoor-air fraction in the HVAC air loop, including the effect of DCV and economizer control."
          >
            <VentilationOutdoorAirControl compared={props.compared} baseline={props.analysis.baseline} />
          </ComparisonSection>

          <Show when={zonesWithWindows().length > 0}>
            <ComparisonSection
              title="Window opening by thermal zone"
              description="Average window opening percentage in each zone at every timestep."
            >
              <div class="grid gap-4 xl:grid-cols-2">
                <For each={zonesWithWindows()}>
                  {(zone) => (
                    <Chart title={zone}>
                      <EChart option={zoneWindowOption(props.compared, zone)} />
                    </Chart>
                  )}
                </For>
              </div>
            </ComparisonSection>
          </Show>

          <ComparisonSection
            title="Compare Construction Sets"
            description="Review construction differences and their effect on operative temperature against the baseline."
          >
            <ConstructionSetComparison
              simulations={props.compared.map((item) => item.simulation)}
            />
            <div class="mt-6 border-t border-warm-stone/15 pt-6">
              <OperativeTemperatureComparisonView
                baseline={props.analysis.baseline}
                comparedSimulations={props.compared}
                comparisons={activeZoneComparisons()}
                zoneName={activeThermalZone()}
              />
            </div>
          </ComparisonSection>
        </div>
      </div>
    </section>
  );
}

function ComparisonSimulationCard(props: {
  item: ComparedSimulation;
  index: number;
  baseline: boolean;
}) {
  const simulation = () => props.item.simulation;
  return (
    <article class="overflow-hidden rounded-2xl border border-warm-stone/20 bg-cloud-white">
      <header class="border-b border-citadel-blue/10 bg-sky-mist/30 px-4 py-3">
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 items-start gap-3">
            <span
              class="grid size-7 shrink-0 place-items-center rounded-full bg-citadel-blue text-xs font-bold text-cloud-white"
              style={{
                "background-color": colors[(props.index - 1) % colors.length],
              }}
            >
              {props.index}
            </span>
            <div class="min-w-0">
              <h3
                class="truncate font-bold text-graphite"
                title={simulationTitle(simulation())}
              >
                {simulationTitle(simulation())}
              </h3>
              <p class="mt-1 text-[0.68rem] text-graphite/50">
                {simulationDate(simulation())}
              </p>
            </div>
          </div>
          <Show when={props.baseline}>
            <span class="shrink-0 rounded-full bg-citadel-blue px-2 py-1 text-[0.62rem] font-bold text-cloud-white">
              Baseline
            </span>
          </Show>
        </div>
      </header>
      <div class="px-4 py-2">
        <ParameterRow label="City" value={cityLabel(simulation().city)} />
        <ParameterRow label="Scenario" value={simulation().scenarioType} />
        <ParameterRow
          label="Construction"
          value={simulation().constructionSetName || "Not specified"}
        />
        <ParameterRow label="Green wall" value={plantLabel(simulation())} />
        <ParameterRow label="Open windows" value={windowsLabel(simulation())} />
        <ParameterRow
          label="CO₂ control"
          value={co2ControlLabel(simulation())}
        />
      </div>
    </article>
  );
}

function ParameterRow(props: { label: string; value: string }) {
  return (
    <div class="grid grid-cols-[6rem_minmax(0,1fr)] gap-3 border-b border-warm-stone/10 py-2.5 text-xs last:border-0">
      <span class="text-graphite/45">{props.label}</span>
      <span class="break-words text-right font-semibold text-graphite/70">
        {props.value}
      </span>
    </div>
  );
}

function ComparisonSection(props: {
  title: string;
  description: string;
  children: unknown;
}) {
  const [open, setOpen] = createSignal(false);
  return (
    <section class="overflow-hidden rounded-2xl border border-warm-stone/20 bg-cloud-white">
      <button
        type="button"
        aria-expanded={open()}
        onClick={() => setOpen((value) => !value)}
        class="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-sky-mist/15"
      >
        <span class="min-w-0 flex-1">
          <strong class="block text-sm text-graphite">{props.title}</strong>
          <span class="mt-1 block text-xs text-graphite/50">
            {props.description}
          </span>
        </span>
        <ChevronDown
          class="size-5 shrink-0 text-citadel-blue transition-transform"
          classList={{ "rotate-180": open() }}
        />
      </button>
      <Show when={open()}>
        <div class="border-t border-warm-stone/15 p-4 sm:p-5">
          {props.children as any}
        </div>
      </Show>
    </section>
  );
}

function EnergyTotals(props: { compared: ComparedSimulation[] }) {
  const delta = (value: number | null | undefined, unit: string) =>
    typeof value === "number" ? `${value >= 0 ? "+" : ""}${number(value)} ${unit}` : "—";
  return (
    <section>
      <h3 class="mb-3 text-sm font-bold text-graphite">
        Absolute energy consumption
      </h3>
      <div class="cozy-scrollbar overflow-x-auto rounded-2xl border border-warm-stone/20">
        <table class="min-w-full text-sm">
          <thead class="bg-sky-mist/25 text-left text-xs uppercase tracking-wide text-graphite/50">
            <tr>
              <th class="p-3">Simulation</th>
              <th class="p-3">Heating</th>
              <th class="p-3">Δ Heating</th>
              <th class="p-3">Cooling</th>
              <th class="p-3">Δ Cooling</th>
              <th class="p-3">Total HVAC</th>
              <th class="p-3">Δ Total HVAC</th>
              <th class="p-3">Δ Total HVAC %</th>
              <th class="p-3">HVAC / total floor area</th>
              <th class="p-3">HVAC / total volume</th>
            </tr>
          </thead>
          <tbody>
            <For each={props.compared}>
              {(item) => {
                const metrics = item.analytics.metrics;
                return (
                  <tr class="border-t border-warm-stone/10">
                    <td class="p-3 font-bold text-graphite">
                      {item.simulation.name}
                    </td>
                    <td class="p-3">{metric(metrics.totalHeatingKwh, "kWh")}</td>
                    <td class="p-3">
                      {delta(metrics.totalHeatingKwhDelta, "kWh")}
                    </td>
                    <td class="p-3">{metric(metrics.totalCoolingKwh, "kWh")}</td>
                    <td class="p-3">
                      {delta(metrics.totalCoolingKwhDelta, "kWh")}
                    </td>
                    <td class="p-3">{metric(metrics.totalHvacKwh, "kWh")}</td>
                    <td class="p-3">
                      {delta(metrics.totalHvacKwhDelta, "kWh")}
                    </td>
                    <td class="p-3">
                      {delta(metrics.totalHvacKwhDeltaPercent, "%")}
                    </td>
                    <td class="p-3">
                      {metric(metrics.hvacKwhPerM2, "kWh/m²")}
                    </td>
                    <td class="p-3">
                      {metric(metrics.hvacKwhPerM3, "kWh/m³")}
                    </td>
                  </tr>
                );
              }}
            </For>
          </tbody>
        </table>
      </div>
    </section>
  );
}

function VentilationOutdoorAirControl(props: {
  compared: ComparedSimulation[];
  baseline: SimulationReference;
}) {
  const deltaPercent = (value: number | null | undefined) =>
    typeof value === "number" ? `${value >= 0 ? "+" : ""}${number(value)} %` : "—";
  return (
    <>
      <div class="cozy-scrollbar overflow-x-auto rounded-2xl border border-warm-stone/20">
        <table class="min-w-full text-sm">
          <thead class="bg-sky-mist/25 text-left text-xs uppercase tracking-wide text-graphite/50">
            <tr>
              <th class="p-3">Simulation</th>
              <th class="p-3">
                Mean outdoor-air fraction · 08:00–10:00, weekdays
              </th>
              <th class="p-3">Δ outdoor-air fraction %</th>
            </tr>
          </thead>
          <tbody>
            <For each={props.compared}>
              {(item) => {
                const value = item.analytics.metrics.meanOutdoorAirPercent;
                return (
                  <tr class="border-t border-warm-stone/10">
                    <td class="p-3 font-bold text-graphite">
                      {item.simulation.name}
                    </td>
                    <td class="p-3">
                      {typeof value === "number"
                        ? `${number(value)} %`
                        : "—"}
                    </td>
                    <td class="p-3">{deltaPercent(item.analytics.metrics.meanOutdoorAirFractionDeltaPercent)}</td>
                  </tr>
                );
              }}
            </For>
          </tbody>
        </table>
      </div>
      <div class="mt-4">
        <Chart title="Outdoor-air fraction over time">
          <EChart option={outdoorAirFractionOption(props.compared)} />
        </Chart>
      </div>
      <div class="mt-4">
        <Chart title="Δ Outdoor-air fraction over time">
          <p class="mb-2 text-xs text-graphite/55">
            Baseline minus each simulation, in percentage points, at matching timestamps.
          </p>
          <EChart option={deltaOutdoorAirFractionOption(props.compared, props.baseline)} />
        </Chart>
      </div>
    </>
  );
}

type MeterField =
  "heating_electricity_j" | "cooling_electricity_j" | "hvac_electricity_j";

function meterOption(
  compared: ComparedSimulation[],
  field: MeterField,
): EChartsOption {
  return lineOption(compared, "kWh / timestep", (item, index) =>
    item.timesteps[index]?.results?.meter_results?.[
      field.replace("_j", "_kwh") as "heating_electricity_kwh" | "cooling_electricity_kwh" | "hvac_electricity_kwh"
    ] ?? null,
  );
}

function outdoorAirFractionOption(
  compared: ComparedSimulation[],
): EChartsOption {
  return lineOption(compared, "Outdoor-air fraction [%]", (item, index) => {
    const fraction = item.timesteps[index]?.results?.outdoor_air_flow_fraction;
    return typeof fraction === "number" && Number.isFinite(fraction)
      ? fraction * 100
      : null;
  });
}

function deltaOutdoorAirFractionOption(
  compared: ComparedSimulation[],
  baseline: SimulationReference,
): EChartsOption {
  const baselineSimulation = compared.find((item) => item.simulation.id === baseline.id);
  const baselineValues = new Map<number, number>();
  for (const step of baselineSimulation?.timesteps ?? []) {
    const timestamp = step.simulation_timestamp ? Date.parse(step.simulation_timestamp) : NaN;
    const fraction = step.results?.outdoor_air_flow_fraction;
    if (Number.isFinite(timestamp) && typeof fraction === "number" && Number.isFinite(fraction)) {
      baselineValues.set(timestamp, fraction);
    }
  }
  const alternatives = compared.filter((item) => item.simulation.id !== baseline.id);
  return {
    color: alternatives.map((_, index) => colors[(index + 1) % colors.length]),
    tooltip: { trigger: "axis" },
    legend: { bottom: 0, type: "scroll" },
    grid: { left: 62, right: 18, top: 24, bottom: 108 },
    xAxis: { type: "time", axisLabel: { hideOverlap: true } },
    yAxis: { type: "value", name: "Δ outdoor air [pp]" },
    dataZoom: [{ type: "inside" }, { type: "slider", height: 18, bottom: 38 }],
    series: alternatives.map((item, index) => ({
      name: `${baseline.name} − ${item.simulation.name}`,
      type: "line",
      showSymbol: false,
      data: item.timesteps.flatMap((step) => {
        const timestamp = step.simulation_timestamp ? Date.parse(step.simulation_timestamp) : NaN;
        if (!Number.isFinite(timestamp)) return [];
        const base = baselineValues.get(timestamp);
        const fraction = step.results?.outdoor_air_flow_fraction;
        return [[timestamp, base !== undefined && typeof fraction === "number" && Number.isFinite(fraction)
          ? (base - fraction) * 100
          : null]];
      }),
      markLine: index === 0 ? {
        symbol: "none", silent: true,
        lineStyle: { color: "#8B7D73", type: "dashed" }, data: [{ yAxis: 0 }],
      } : undefined,
    })),
  };
}

type ThermalZoneMetric = "temperature" | "humidity";
type ThermalZoneMetricField = "zone_air_temp_c" | "relative_humidity_percent";

function thermalZoneMetricConfig(metric: ThermalZoneMetric) {
  return metric === "temperature"
    ? {
        field: "zone_air_temp_c" as const,
        label: "Zone air temperature",
        unit: "°C",
        deltaUnit: "°C",
        deltaAxis: "Δ zone air temperature [°C]",
      }
    : {
        field: "relative_humidity_percent" as const,
        label: "Relative humidity",
        unit: "%",
        deltaUnit: "percentage points",
        deltaAxis: "Δ relative humidity [percentage points]",
      };
}

function zoneMetricValue(
  timestep: SimulationTimestep | undefined,
  zone: string,
  field: ThermalZoneMetricField,
): number | null {
  const value = timestep?.results?.zone_results?.[zone]?.[field];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function zoneMetricOption(
  compared: ComparedSimulation[],
  zone: string,
  field: ThermalZoneMetricField,
  unit: string,
): EChartsOption {
  return lineOption(compared, unit, (item, index) =>
    zoneMetricValue(item.timesteps[index], zone, field),
  );
}

function deltaZoneMetricOption(
  compared: ComparedSimulation[],
  baselineId: string,
  zone: string,
  field: ThermalZoneMetricField,
  deltaAxis: string,
): EChartsOption {
  const baseline = compared.find((item) => item.simulation.id === baselineId);
  const alternatives = compared.filter((item) => item.simulation.id !== baselineId);
  const baselineByTime = new Map<number, number>();
  baseline?.timesteps.forEach((timestep) => {
    const timestamp = timestep.simulation_timestamp
      ? Date.parse(timestep.simulation_timestamp)
      : NaN;
    const value = zoneMetricValue(timestep, zone, field);
    if (Number.isFinite(timestamp) && value !== null) baselineByTime.set(timestamp, value);
  });
  const names = alternatives.map((item) => `${baseline?.simulation.name ?? "Baseline"} − ${item.simulation.name}`);
  return {
    color: alternatives.map((_, index) => colors[(index + 1) % colors.length]),
    tooltip: { trigger: "axis" },
    legend: { data: names, bottom: 0, type: "scroll" },
    grid: { left: 70, right: 18, top: 24, bottom: 108 },
    xAxis: { type: "time", axisLabel: { hideOverlap: true } },
    yAxis: { type: "value", name: deltaAxis },
    dataZoom: [{ type: "inside" }, { type: "slider", height: 18, bottom: 38 }],
    series: alternatives.map((item, index) => ({
      name: names[index],
      type: "line",
      showSymbol: false,
      data: item.timesteps.flatMap((timestep) => {
        const timestamp = timestep.simulation_timestamp
          ? Date.parse(timestep.simulation_timestamp)
          : NaN;
        const value = zoneMetricValue(timestep, zone, field);
        const baselineValue = baselineByTime.get(timestamp);
        return Number.isFinite(timestamp) && value !== null && baselineValue !== undefined
          ? [[timestamp, baselineValue - value]]
          : [];
      }),
      markLine: index === 0
        ? { symbol: "none", silent: true, lineStyle: { color: "#8B7D73", type: "dashed" }, data: [{ yAxis: 0 }] }
        : undefined,
    })),
  };
}

function summarize(values: Array<number | null>) {
  const finite = values.filter((value): value is number => value !== null && Number.isFinite(value));
  if (finite.length === 0) return null;
  return {
    mean: finite.reduce((sum, value) => sum + value, 0) / finite.length,
    min: Math.min(...finite),
    max: Math.max(...finite),
  };
}

function pairedZoneMetricDeltas(
  baseline: ComparedSimulation | undefined,
  compared: ComparedSimulation,
  zone: string,
  field: ThermalZoneMetricField,
) {
  if (!baseline || baseline.simulation.id === compared.simulation.id) return [];
  const baselineByTime = new Map<number, number>();
  baseline.timesteps.forEach((timestep) => {
    const timestamp = timestep.simulation_timestamp ? Date.parse(timestep.simulation_timestamp) : NaN;
    const value = zoneMetricValue(timestep, zone, field);
    if (Number.isFinite(timestamp) && value !== null) baselineByTime.set(timestamp, value);
  });
  return compared.timesteps.flatMap((timestep) => {
    const timestamp = timestep.simulation_timestamp ? Date.parse(timestep.simulation_timestamp) : NaN;
    const value = zoneMetricValue(timestep, zone, field);
    const baselineValue = baselineByTime.get(timestamp);
    return Number.isFinite(timestamp) && value !== null && baselineValue !== undefined
      ? [baselineValue - value]
      : [];
  });
}

function ThermalZoneMetricComparisonView(props: {
  compared: ComparedSimulation[];
  baseline: SimulationReference;
  zone: string;
  metric: ThermalZoneMetric;
}) {
  const config = () => thermalZoneMetricConfig(props.metric);
  const baseline = () => props.compared.find((item) => item.simulation.id === props.baseline.id);
  const summaries = () => props.compared.map((item) => ({
    item,
    values: summarize(item.timesteps.map((timestep) => zoneMetricValue(timestep, props.zone, config().field))),
    deltas: summarize(pairedZoneMetricDeltas(baseline(), item, props.zone, config().field)),
  }));
  const display = (value: number | null | undefined, unit = config().unit) =>
    typeof value === "number" && Number.isFinite(value) ? `${number(value)} ${unit}` : "—";

  return (
    <div class="space-y-5">
      <Chart title={`${props.zone} · ${config().label}`}>
        <EChart option={zoneMetricOption(props.compared, props.zone, config().field, config().unit)} class="h-[26rem] w-full sm:h-[30rem]" />
      </Chart>
      <Show when={props.compared.length > 1}>
        <section>
          <div class="mb-3">
            <h3 class="font-bold text-graphite">Difference against baseline</h3>
            <p class="mt-1 text-xs text-graphite/50">
              Values are baseline minus the compared simulation, matched by timestamp. Relative-humidity differences are percentage points.
            </p>
          </div>
          <Chart title={`${props.zone} · difference from baseline`}>
            <EChart option={deltaZoneMetricOption(props.compared, props.baseline.id, props.zone, config().field, config().deltaAxis)} class="h-[26rem] w-full sm:h-[30rem]" />
          </Chart>
        </section>
      </Show>
      <section>
        <h3 class="mb-3 font-bold text-graphite">Summary metrics</h3>
        <div class="cozy-scrollbar overflow-x-auto rounded-2xl border border-warm-stone/20">
          <table class="min-w-full text-sm">
            <thead class="bg-sky-mist/25 text-left text-xs uppercase tracking-wide text-graphite/50">
              <tr>
                <th class="p-3">Simulation</th><th class="p-3">Mean</th><th class="p-3">Maximum</th><th class="p-3">Minimum</th>
                <th class="p-3">Mean Δ vs baseline</th><th class="p-3">Maximum Δ vs baseline</th><th class="p-3">Minimum Δ vs baseline</th>
              </tr>
            </thead>
            <tbody>
              <For each={summaries()}>
                {(summary) => (
                  <tr class="border-t border-warm-stone/10">
                    <td class="p-3 font-semibold text-graphite">{summary.item.simulation.name}{summary.item.simulation.id === props.baseline.id ? " · baseline" : ""}</td>
                    <td class="p-3">{display(summary.values?.mean)}</td><td class="p-3">{display(summary.values?.max)}</td><td class="p-3">{display(summary.values?.min)}</td>
                    <td class="p-3">{summary.item.simulation.id === props.baseline.id ? display(0, config().deltaUnit) : display(summary.deltas?.mean, config().deltaUnit)}</td>
                    <td class="p-3">{summary.item.simulation.id === props.baseline.id ? display(0, config().deltaUnit) : display(summary.deltas?.max, config().deltaUnit)}</td>
                    <td class="p-3">{summary.item.simulation.id === props.baseline.id ? display(0, config().deltaUnit) : display(summary.deltas?.min, config().deltaUnit)}</td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function zoneCo2Option(
  compared: ComparedSimulation[],
  zone: string,
): EChartsOption {
  return lineOption(
    compared,
    "ppm",
    (item, index) =>
      item.timesteps[index]?.results?.zone_results?.[zone]
        ?.co2_concentration_ppm ?? null,
  );
}

function zoneOperativeTemperatureOption(
  compared: ComparedSimulation[],
  zone: string,
): EChartsOption {
  return lineOption(compared, "°C", (item, index) => {
    const result = item.timesteps[index]?.results?.zone_results?.[zone];
    return result?.operative_temperature_c ?? null;
  });
}

function zoneWindowOption(
  compared: ComparedSimulation[],
  zone: string,
): EChartsOption {
  return lineOption(compared, "Opening %", (item, index) =>
    zoneWindowOpeningPercent(item.timesteps[index], zone),
  );
}

function deltaCo2Option(
  baseline: SimulationReference,
  comparisons: Array<{
    comparison: ScenarioComparison;
    zone: ThermalZoneComparison;
  }>,
  plantConfigurations: ComparisonPlantConfiguration[],
): EChartsOption {
  const seriesNames = comparisons.map(({ comparison }) => {
    const plantName = plantConfigurations.find(
      (configuration) =>
        configuration.simulationId === comparison.simulation.id,
    )?.plantName;
    const comparedLabel = plantName
      ? `${comparison.simulation.name} · ${plantName}`
      : comparison.simulation.name;
    return `${baseline.name} − ${comparedLabel}`;
  });
  return {
    color: comparisons.map((_, index) => colors[(index + 1) % colors.length]),
    tooltip: { trigger: "axis" },
    legend: {
      data: seriesNames,
      bottom: 0,
      type: "scroll",
      selectedMode: true,
    },
    grid: { left: 62, right: 18, top: 24, bottom: 108 },
    xAxis: {
      type: "time",
      axisLabel: { hideOverlap: true },
    },
    yAxis: { type: "value", name: "ΔCO₂ [ppm]" },
    dataZoom: [{ type: "inside" }, { type: "slider", height: 18, bottom: 38 }],
    series: comparisons.map(({ zone }, index) => ({
      name: seriesNames[index],
      type: "line",
      showSymbol: false,
      data: zone.deltaCo2Series.map((point) => [point.timestamp, point.ppm]),
      markLine:
        index === 0
          ? {
              symbol: "none",
              silent: true,
              lineStyle: { color: "#8B7D73", type: "dashed" },
              data: [{ yAxis: 0 }],
            }
          : undefined,
    })),
  };
}

function deltaOperativeTemperatureOption(
  baseline: SimulationReference,
  comparisons: Array<{
    comparison: ScenarioComparison;
    zone: ThermalZoneComparison;
  }>,
): EChartsOption {
  const seriesNames = comparisons.map(
    ({ comparison }) => `${baseline.name} − ${comparison.simulation.name}`,
  );
  return {
    color: comparisons.map((_, index) => colors[(index + 1) % colors.length]),
    tooltip: { trigger: "axis" },
    legend: {
      data: seriesNames,
      bottom: 0,
      type: "scroll",
      selectedMode: true,
    },
    grid: { left: 62, right: 18, top: 24, bottom: 108 },
    xAxis: { type: "time", axisLabel: { hideOverlap: true } },
    yAxis: { type: "value", name: "Δ operative temperature [°C]" },
    dataZoom: [{ type: "inside" }, { type: "slider", height: 18, bottom: 38 }],
    series: comparisons.map(({ zone }, index) => ({
      name: seriesNames[index],
      type: "line",
      showSymbol: false,
      data: (zone.deltaOperativeTemperatureSeries ?? []).map((point) => [
        point.timestamp,
        point.temperatureC,
      ]),
      markLine:
        index === 0
          ? {
              symbol: "none",
              silent: true,
              lineStyle: { color: "#8B7D73", type: "dashed" },
              data: [{ yAxis: 0 }],
            }
          : undefined,
    })),
  };
}

function Co2SummaryComparisonView(props: {
  baseline: SimulationReference;
  comparisons: Array<{
    comparison: ScenarioComparison;
    zone: ThermalZoneComparison;
  }>;
  comparedSimulations: ComparedSimulation[];
  plantConfigurations: ComparisonPlantConfiguration[];
  analysisRange: SimulationComparisonResponse["analysisRange"];
}) {
  const zoneName = () => props.comparisons[0]?.zone.zoneName ?? "Thermal zone";
  const plantName = (simulationId: string) =>
    configurationFor(simulationId)?.plantName;
  const configurationFor = (simulationId: string) =>
    props.plantConfigurations.find(
      (configuration) => configuration.simulationId === simulationId,
    );
  const totalLeafAreaInSelectedZone = (simulationId: string) => {
    const simulation = props.comparedSimulations.find(
      (candidate) => candidate.simulation.id === simulationId,
    );
    return simulation?.analytics.zones[zoneName()]?.totalLeafAreaM2 ?? null;
  };
  const zoneMetric = (
    simulationId: string,
    field: "floor_area_m2" | "air_volume_m3",
  ) => {
    const simulation = props.comparedSimulations.find(
      (candidate) => candidate.simulation.id === simulationId,
    );
    return simulation?.analytics.zones[zoneName()]?.[field] ?? null;
  };
  const meanPeopleCo2GenerationPpmPerHour = (simulationId: string) => {
    const simulation = props.comparedSimulations.find(
      (candidate) => candidate.simulation.id === simulationId,
    );
    return simulation?.analytics.zones[zoneName()]?.meanPeopleCo2GenerationPpmPerHour ?? null;
  };
  const zoneRows = () => [
    {
      label: "Floor area",
      description: "EnergyPlus floor area of the selected thermal zone.",
      value: ({ comparison }: (typeof props.comparisons)[number]) => {
        const value = zoneMetric(comparison.simulation.id, "floor_area_m2");
        return typeof value === "number" ? `${number(value)} m²` : "—";
      },
    },
    {
      label: "Air volume",
      description: "EnergyPlus air volume of the selected thermal zone.",
      value: ({ comparison }: (typeof props.comparisons)[number]) => {
        const value = zoneMetric(comparison.simulation.id, "air_volume_m3");
        return typeof value === "number" ? `${number(value)} m³` : "—";
      },
    },
    {
      label: "Mean people CO₂ generation · 08:00–10:00, weekdays",
      description:
        "Mean CO₂ generation from occupied people only, calculated from the EnergyPlus People CO₂ factor and the zone air volume. Zero-occupancy timesteps are excluded.",
      value: ({ comparison }: (typeof props.comparisons)[number]) => {
        const value = meanPeopleCo2GenerationPpmPerHour(
          comparison.simulation.id,
        );
        return typeof value === "number" ? `${number(value)} ppm/h` : "—";
      },
    },
  ];
  const co2Rows = () => [
    {
      label: "Mean ΔCO₂",
      description:
        "Average of baseline CO₂ minus compared CO₂ across the full effective range.",
      value: ({ zone }: (typeof props.comparisons)[number]) =>
        `${number(zone.summary.meanDeltaCo2Ppm)} ppm`,
    },
    {
      label: "Maximum ΔCO₂",
      description:
        "Largest baseline-minus-compared CO₂ difference during the full effective range.",
      value: ({ zone }: (typeof props.comparisons)[number]) =>
        `${number(zone.summary.maxDeltaCo2Ppm)} ppm`,
    },
    {
      label: "Minimum ΔCO₂",
      description:
        "Smallest, most negative baseline-minus-compared CO₂ difference during the full effective range.",
      value: ({ zone }: (typeof props.comparisons)[number]) =>
        `${number(zone.summary.minDeltaCo2Ppm)} ppm`,
    },
    {
      label: "Mean ΔCO₂",
      description:
        "Average of baseline CO₂ minus compared CO₂ across the full effective range.",
      value: ({ zone }: (typeof props.comparisons)[number]) =>
        `${number(zone.summary.meanDeltaCo2Ppm)} ppm`,
    },
    {
      label: "Mean ΔCO₂ · 08:00–10:00, weekdays",
      description:
        "Average baseline-minus-compared CO₂ difference from Monday to Friday between 08:00 and 10:00.",
      value: ({ zone }: (typeof props.comparisons)[number]) =>
        typeof zone.summary.meanMorningWeekdayDeltaCo2Ppm === "number"
          ? `${number(zone.summary.meanMorningWeekdayDeltaCo2Ppm)} ppm`
          : "—",
    },
    {
      label: "Maximum ΔCO₂ · 08:00–10:00, weekdays",
      description:
        "Largest baseline-minus-compared CO₂ difference from Monday to Friday between 08:00 and 10:00.",
      value: ({ zone }: (typeof props.comparisons)[number]) =>
        typeof zone.summary.maxMorningWeekdayDeltaCo2Ppm === "number"
          ? `${number(zone.summary.maxMorningWeekdayDeltaCo2Ppm)} ppm`
          : "—",
    },
    {
      label: "Minimum ΔCO₂ · 08:00–10:00, weekdays",
      description:
        "Lowest baseline-minus-compared CO₂ difference from Monday to Friday between 08:00 and 10:00.",
      value: ({ zone }: (typeof props.comparisons)[number]) =>
        typeof zone.summary.minMorningWeekdayDeltaCo2Ppm === "number"
          ? `${number(zone.summary.minMorningWeekdayDeltaCo2Ppm)} ppm`
          : "—",
    },
    {
      label: "Mean ΔCO₂ rate · 08:00–10:00, weekdays",
      description:
        "Average timestep-to-timestep change in baseline-minus-compared CO₂ from Monday to Friday between 08:00 and 10:00.",
      value: ({ zone }: (typeof props.comparisons)[number]) =>
        typeof zone.summary.meanMorningWeekdayDeltaCo2RatePpmPerHour === "number"
          ? `${number(zone.summary.meanMorningWeekdayDeltaCo2RatePpmPerHour)} ppm/h`
          : "—",
    },
    {
      label: "Mean ΔCO₂ rate · 22:00–08:00, weekdays",
      description:
        "Average timestep-to-timestep change in baseline-minus-compared CO₂ from Monday to Friday between 22:00 and 08:00.",
      value: ({ zone }: (typeof props.comparisons)[number]) =>
        typeof zone.summary.meanNightWeekdayDeltaCo2RatePpmPerHour === "number"
          ? `${number(zone.summary.meanNightWeekdayDeltaCo2RatePpmPerHour)} ppm/h`
          : "—",
    },
  ];
  const plantRows = () => [
    {
      label: "Mean ΔCO₂ · lights on (08:00–22:00, weekdays)",
      description:
        "Average baseline-minus-compared CO₂ difference from Monday to Friday while the selected plant lighting is on.",
      value: ({ comparison, zone }: (typeof props.comparisons)[number]) => {
        const configuration = configurationFor(comparison.simulation.id);
        return configuration?.enabled &&
          typeof zone.summary.meanLightsOnDeltaCo2Ppm === "number"
          ? `${number(zone.summary.meanLightsOnDeltaCo2Ppm)} ppm`
          : "—";
      },
    },
    {
      label: "Mean ΔCO₂ · lights off (22:00–08:00, weekdays)",
      description:
        "Average baseline-minus-compared CO₂ difference from Monday to Friday while the selected plant lighting is off.",
      value: ({ comparison, zone }: (typeof props.comparisons)[number]) => {
        const configuration = configurationFor(comparison.simulation.id);
        return configuration?.enabled &&
          typeof zone.summary.meanLightsOffDeltaCo2Ppm === "number"
          ? `${number(zone.summary.meanLightsOffDeltaCo2Ppm)} ppm`
          : "—";
      },
    },
    {
      label: "PPFD",
      description:
        "Selected incident lighting level at the plant canopy while the lights are on.",
      value: ({ comparison }: (typeof props.comparisons)[number]) =>
        scientificValue(
          configurationFor(comparison.simulation.id)?.ppfdUmolM2S,
          "μmol·m⁻²·s⁻¹",
        ),
    },
    {
      label: "Total leaf area · selected zone",
      description:
        "Total modelled leaf area scaled to the green-wall area installed in the selected thermal zone.",
      value: ({ comparison }: (typeof props.comparisons)[number]) =>
        scientificValue(
          totalLeafAreaInSelectedZone(comparison.simulation.id),
          "m²",
        ),
    },
    {
      label: "Mean PARleaf",
      description:
        "Leaf-area-weighted mean PAR absorbed by the leaves for the selected PPFD.",
      value: ({ comparison }: (typeof props.comparisons)[number]) =>
        scientificValue(
          configurationFor(comparison.simulation.id)?.meanParLeafUmolM2S,
          "μmol·m⁻²·s⁻¹",
        ),
    },
  ];
  return (
    <section class="overflow-hidden rounded-2xl border border-warm-stone/20 bg-cloud-white">
      <div class="mb-4">
        <div class="border-b border-citadel-blue/10 bg-sky-mist/30 px-4 py-3 sm:px-5">
          <h3 class="font-bold text-graphite">{zoneName()}</h3>
          <p class="mt-1 text-xs text-graphite/50">
            Baseline: {props.baseline.name}
          </p>
        </div>
      </div>
      <div class="overflow-x-auto px-4 pb-4 sm:px-5 sm:pb-5">
        <table class="w-full min-w-[44rem] border-separate border-spacing-0 text-left text-xs">
          <thead>
            <tr>
              <th class="border-b border-warm-stone/20 p-3 font-bold text-graphite/55">
                Metric
              </th>
              <For each={props.comparisons}>
                {({ comparison }, index) => (
                  <th class="border-b border-warm-stone/20 p-3 align-bottom">
                    <div
                      class="pt-3"
                      style={{
                        "border-top": `3px solid ${colors[(index() + 1) % colors.length]}`,
                      }}
                    >
                      <p class="font-bold text-graphite">
                        {comparison.simulation.name}
                      </p>
                      <p class="mt-1 font-normal text-graphite/50">
                        {plantName(comparison.simulation.id) || "—"}
                      </p>
                    </div>
                  </th>
                )}
              </For>
            </tr>
          </thead>
          <tbody>
            <SummarySubsectionRow
              title="Zone metrics"
              columns={props.comparisons.length + 1}
            />
            <For each={zoneRows()}>
              {(row) => (
                <tr>
                  <th
                    class="cursor-help border-b border-warm-stone/10 bg-sky-mist/15 p-3 font-semibold text-graphite/60"
                    title={row.description}
                  >
                    {row.label}
                  </th>
                  <For each={props.comparisons}>
                    {(entry) => (
                      <td class="border-b border-warm-stone/10 p-3 font-semibold text-graphite">
                        {row.value(entry)}
                      </td>
                    )}
                  </For>
                </tr>
              )}
            </For>
            <SummarySubsectionRow
              title="CO₂ metrics"
              columns={props.comparisons.length + 1}
            />
            <For each={co2Rows()}>
              {(row) => (
                <tr>
                  <th
                    class="cursor-help border-b border-warm-stone/10 bg-sky-mist/15 p-3 font-semibold text-graphite/60"
                    title={row.description}
                  >
                    {row.label}
                  </th>
                  <For each={props.comparisons}>
                    {(entry) => (
                      <td class="border-b border-warm-stone/10 p-3 font-semibold text-graphite">
                        {row.value(entry)}
                      </td>
                    )}
                  </For>
                </tr>
              )}
            </For>
            <SummarySubsectionRow
              title="Green Wall Analytics"
              columns={props.comparisons.length + 1}
            />
            <For each={plantRows()}>
              {(row) => (
                <tr>
                  <th
                    class="cursor-help border-b border-warm-stone/10 bg-sky-mist/15 p-3 font-semibold text-graphite/60"
                    title={row.description}
                  >
                    {row.label}
                  </th>
                  <For each={props.comparisons}>
                    {(entry) => (
                      <td class="border-b border-warm-stone/10 p-3 font-semibold text-graphite">
                        {row.value(entry)}
                      </td>
                    )}
                  </For>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
      <p class="border-t border-warm-stone/10 px-4 py-3 text-[0.68rem] text-graphite/45 sm:px-5">
        Plant-light metrics use weekdays only (Monday–Friday). Saturday and
        Sunday are excluded.
      </p>
      <Show when={props.analysisRange.start && props.analysisRange.end}>
        <p class="border-t border-warm-stone/10 px-4 py-3 text-[0.68rem] text-graphite/45 sm:px-5">
          Effective range:{" "}
          {new Date(props.analysisRange.start!).toLocaleString()} –{" "}
          {new Date(props.analysisRange.end!).toLocaleString()}
        </p>
      </Show>
    </section>
  );
}

function OperativeTemperatureComparisonView(props: {
  baseline: SimulationReference;
  comparedSimulations: ComparedSimulation[];
  comparisons: Array<{
    comparison: ScenarioComparison;
    zone: ThermalZoneComparison;
  }>;
  zoneName: string;
}) {
  const hasOperativeTemperature = () =>
    props.comparisons.some(
      ({ zone }) => (zone.deltaOperativeTemperatureSeries?.length ?? 0) > 0,
    );
  const rows = () => [
    {
      label: "Mean Δ operative temperature",
      description:
        "Average baseline-minus-compared operative temperature across the full effective range.",
      value: ({ zone }: (typeof props.comparisons)[number]) =>
        scientificValue(
          zone.operativeTemperatureSummary?.meanDeltaOperativeTemperatureC,
          "°C",
        ),
    },
    {
      label: "Maximum Δ operative temperature",
      description:
        "Largest baseline-minus-compared operative temperature difference across the full effective range.",
      value: ({ zone }: (typeof props.comparisons)[number]) =>
        scientificValue(
          zone.operativeTemperatureSummary?.maxDeltaOperativeTemperatureC,
          "°C",
        ),
    },
    {
      label: "Minimum Δ operative temperature",
      description:
        "Smallest baseline-minus-compared operative temperature difference across the full effective range.",
      value: ({ zone }: (typeof props.comparisons)[number]) =>
        scientificValue(
          zone.operativeTemperatureSummary?.minDeltaOperativeTemperatureC,
          "°C",
        ),
    },
    {
      label: "Mean Δ operative temperature · 08:00–10:00, weekdays",
      description:
        "Average baseline-minus-compared operative temperature from Monday to Friday between 08:00 and 10:00.",
      value: ({ zone }: (typeof props.comparisons)[number]) =>
        scientificValue(
          zone.operativeTemperatureSummary
            ?.meanMorningWeekdayDeltaOperativeTemperatureC,
          "°C",
        ),
    },
    {
      label: "Maximum Δ operative temperature · 08:00–10:00, weekdays",
      description:
        "Largest baseline-minus-compared operative temperature difference from Monday to Friday between 08:00 and 10:00.",
      value: ({ zone }: (typeof props.comparisons)[number]) =>
        scientificValue(
          zone.operativeTemperatureSummary
            ?.maxMorningWeekdayDeltaOperativeTemperatureC,
          "°C",
        ),
    },
    {
      label: "Minimum Δ operative temperature · 08:00–10:00, weekdays",
      description:
        "Smallest baseline-minus-compared operative temperature difference from Monday to Friday between 08:00 and 10:00.",
      value: ({ zone }: (typeof props.comparisons)[number]) =>
        scientificValue(
          zone.operativeTemperatureSummary
            ?.minMorningWeekdayDeltaOperativeTemperatureC,
          "°C",
        ),
    },
  ];

  return (
    <section>
      <div class="mb-4">
        <p class="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-citadel-blue">
          Thermal comfort indicator
        </p>
        <h3 class="mt-1 text-lg font-bold text-graphite">
          Operative temperature
        </h3>
        <p class="mt-1 max-w-3xl text-xs leading-relaxed text-graphite/55">
          Calculated at every timestep as (zone air temperature + mean radiant
          temperature) / 2. Positive Δ values mean that the baseline feels
          warmer than the compared construction set.
        </p>
      </div>
      <Show
        when={props.zoneName && hasOperativeTemperature()}
        fallback={
          <p class="rounded-xl border border-warm-stone/15 bg-warm-stone/5 p-4 text-sm text-graphite/55">
            Operative-temperature data is not available for this selection.
            Simulations must be run after the mean-radiant-temperature output is
            enabled.
          </p>
        }
      >
        <div class="space-y-5">
          <Chart title={`${props.zoneName} · operative temperature`}>
            <EChart
              option={zoneOperativeTemperatureOption(
                props.comparedSimulations,
                props.zoneName,
              )}
              class="h-[26rem] w-full sm:h-[30rem]"
            />
          </Chart>
          <Chart title={`${props.zoneName} · Δ operative temperature`}>
            <EChart
              option={deltaOperativeTemperatureOption(
                props.baseline,
                props.comparisons,
              )}
              class="h-[26rem] w-full sm:h-[30rem]"
            />
          </Chart>
          <section class="overflow-x-auto rounded-2xl border border-warm-stone/20 bg-cloud-white">
            <table class="w-full min-w-[44rem] border-separate border-spacing-0 text-left text-xs">
              <thead>
                <tr>
                  <th class="border-b border-warm-stone/20 p-3 font-bold text-graphite/55">
                    Metric
                  </th>
                  <For each={props.comparisons}>
                    {({ comparison }, index) => (
                      <th class="border-b border-warm-stone/20 p-3 align-bottom">
                        <div
                          class="pt-3"
                          style={{
                            "border-top": `3px solid ${colors[(index() + 1) % colors.length]}`,
                          }}
                        >
                          <p class="font-bold text-graphite">
                            {comparison.simulation.name}
                          </p>
                        </div>
                      </th>
                    )}
                  </For>
                </tr>
              </thead>
              <tbody>
                <SummarySubsectionRow
                  title="Operative temperature metrics"
                  columns={props.comparisons.length + 1}
                />
                <For each={rows()}>
                  {(row) => (
                    <tr>
                      <th
                        class="cursor-help border-b border-warm-stone/10 bg-sky-mist/15 p-3 font-semibold text-graphite/60"
                        title={row.description}
                      >
                        {row.label}
                      </th>
                      <For each={props.comparisons}>
                        {(entry) => (
                          <td class="border-b border-warm-stone/10 p-3 font-semibold text-graphite">
                            {row.value(entry)}
                          </td>
                        )}
                      </For>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </section>
          <p class="text-[0.68rem] text-graphite/45">
            Working-hours metrics use Monday–Friday, 08:00–10:00 only. Saturday
            and Sunday are excluded.
          </p>
        </div>
      </Show>
    </section>
  );
}

function SummarySubsectionRow(props: { title: string; columns: number }) {
  return (
    <tr>
      <th
        colSpan={props.columns}
        class="border-b border-citadel-blue/10 bg-citadel-blue/5 px-3 py-2 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-citadel-blue"
      >
        {props.title}
      </th>
    </tr>
  );
}

function scientificValue(value: number | null | undefined, unit: string) {
  return typeof value === "number" ? `${number(value)} ${unit}` : "—";
}

function lineOption(
  compared: ComparedSimulation[],
  unit: string,
  valueAt: (item: ComparedSimulation, index: number) => number | null,
): EChartsOption {
  const longest = compared.reduce(
    (current, item) =>
      item.timesteps.length > current.timesteps.length ? item : current,
    compared[0],
  );
  const length = longest?.timesteps.length ?? 0;
  const seriesNames = compared.map(
    (item, index) => `${index + 1}. ${simulationTitle(item.simulation)}`,
  );
  return {
    color: colors,
    tooltip: { trigger: "axis" },
    legend: {
      data: seriesNames,
      bottom: 0,
      type: "scroll",
      selectedMode: true,
    },
    grid: { left: 58, right: 18, top: 24, bottom: 108 },
    xAxis: {
      type: "category",
      data: longest?.timesteps.map(timestampLabel) ?? [],
      axisLabel: { hideOverlap: true },
    },
    yAxis: { type: "value", name: unit },
    dataZoom: [{ type: "inside" }, { type: "slider", height: 18, bottom: 38 }],
    series: compared.map((item, index) => ({
      id: item.simulation.id,
      name: seriesNames[index],
      type: "line",
      showSymbol: false,
      data: Array.from({ length }, (_, index) => valueAt(item, index)),
    })),
  };
}

function Chart(props: { title: string; children: unknown }) {
  return (
    <section class="rounded-2xl border border-warm-stone/20 bg-cloud-white p-4">
      <h2 class="font-bold text-graphite">{props.title}</h2>
      <div class="mt-2">{props.children as any}</div>
    </section>
  );
}

function Loading(props: { label: string }) {
  return (
    <div class="flex min-h-32 items-center justify-center text-sm text-graphite/50">
      <LoaderCircle class="mr-2 size-5 animate-spin" />
      {props.label}
    </div>
  );
}

function number(value: number | null) {
  return value == null || !Number.isFinite(value)
    ? "—"
    : new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
        value,
      );
}

function metric(value: number | null | undefined, unit: string) {
  return typeof value === "number" && Number.isFinite(value) ? `${number(value)} ${unit}` : "—";
}

function SimulationCardRow(props: {
  icon: unknown;
  label: string;
  muted?: boolean;
}) {
  return (
    <div
      class="flex min-w-0 items-center gap-2"
      classList={{ "opacity-45": props.muted }}
    >
      <span class="shrink-0 text-citadel-blue [&>svg]:size-3.5">
        {props.icon as any}
      </span>
      <span class="truncate" title={props.label}>
        {props.label}
      </span>
    </div>
  );
}

function cityLabel(city?: string) {
  if (!city) return "Unknown city";
  return city.charAt(0).toUpperCase() + city.slice(1);
}

function simulationTitle(simulation: SimulationListItem) {
  return simulation.name?.trim() || `Simulation ${simulation.id.slice(0, 8)}`;
}

function simulationDate(simulation: SimulationListItem) {
  const value =
    simulation.requestedAt ?? simulation.startedAt ?? simulation.completedAt;
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function statusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function plantLabel(simulation: SimulationListItem) {
  const plant = simulation.plantSimulation;
  if (!plant) return "Green wall disabled";
  const size = plant.greenWallSize
    ? plant.greenWallSize.toLowerCase().replace("_", " ")
    : "legacy";
  const exchange =
    plant.exchangeMode === "UPTAKE_ONLY" ? "uptake-only" : "full exchange";
  return `${plant.plantName} · ${size} green wall · ${(plant.lightingLevel ?? "MEDIUM").toLowerCase().replace("_", " ")} light · ${exchange}`;
}

function windowsLabel(simulation: SimulationListItem) {
  const windows = simulation.openWindows;
  if (!windows) return "Open windows disabled";
  const strategy = windows.openingStrategy === "ON_OFF" ? "On–Off" : "Linear";
  return `${strategy} · ${windows.co2ThresholdPpm} ppm · ±${windows.temperatureMarginC} °C`;
}

function co2ControlLabel(simulation: SimulationListItem) {
  const control = simulation.co2Control;
  if (!control) return "CO₂ control disabled";
  return `Mechanical ventilation DCV · ${control.setpointPpm} ppm`;
}
