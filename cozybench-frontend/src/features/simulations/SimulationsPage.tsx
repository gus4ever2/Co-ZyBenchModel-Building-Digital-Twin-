import { createMutation, createQuery } from "@tanstack/solid-query";
import axios from "axios";
import type { EChartsOption } from "echarts";
import {
  Check,
  Atom,
  AirVent,
  BrickWall,
  Droplets,
  CalendarDays,
  Eye,
  Gauge,
  GitCompareArrows,
  Leaf,
  LoaderCircle,
  MapPin,
  PanelsTopLeft,
  Thermometer,
  Wind,
  Zap,
  X,
} from "lucide-solid";
import {For, Show, createMemo, createSignal, Switch, Match, lazy, onMount} from "solid-js";
import { Portal } from "solid-js/web";
const PlantModelDialog = lazy(() => import("../plant-dt/PlantModelDialog"));
import EChart from "../../components/charts/EChart";
import ConstructionSetComparison from "./ConstructionSetComparison";
import BuildingInformation, { hasBuildingInformation } from "./BuildingInformation";
import SeasonalEnergyAnalysis from "./SeasonalEnergyAnalysis";
import GreenWallParameters from "./GreenWallParameters";
import TemperatureComparisonChart, { TemperatureSetpointsTable } from "./TemperatureComparisonChart";
import WorkspaceNavigationCard from "../../components/building-dt/WorkspaceNavigationCard";
import EditorIdentityHeader from "../../components/form/EditorIdentityHeader";
import WorkspaceHeader from "../../components/layout/WorkspaceHeader";
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
        <div class="relative flex h-full min-h-0 flex-col">
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
      <header class="flex flex-wrap items-center justify-between gap-3 border-b border-citadel-blue/10 bg-sky-mist/35 px-5 py-4 pr-14">
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
        <div class="cozy-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
          <ConstructionSetComparison simulations={[props.simulation]} />
        </div>
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

type ComparisonPanel =
  | "energy"
  | "co2"
  | "temperature"
  | "humidity"
  | "ventilation"
  | "windowOpening"
  | "greenWall"
  | "thermalZones"
  | "construction";

function ComparisonResults(props: {
  compared: ComparedSimulation[];
  analysis: SimulationComparisonResponse;
}) {
  const [selectedThermalZone, setSelectedThermalZone] = createSignal("");
  const [analysisPlantId, setAnalysisPlantId] = createSignal("");
  const hasGreenWall = () => props.compared.some(item => Boolean(item.simulation.plantSimulation))
    || props.analysis.plantConfigurations.some(item => item.enabled);
  const hasOpenWindows = () => props.compared.some(item => Boolean(item.simulation.openWindows));
  const [activePanel, setActivePanel] = createSignal<ComparisonPanel | null>(null);
  const thermalZones = createMemo(() => {
    const names = new Set<string>();
    props.analysis.comparisons.forEach((comparison) =>
      comparison.thermalZones.forEach((zone) => names.add(zone.zoneName)),
    );
    return [...names].sort((left, right) => left.localeCompare(right));
  });
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
  const activeThermalZone = createMemo(() => {
    const availableZones = activePanel() === "windowOpening"
      ? zonesWithWindows()
      : thermalZones();
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
  const panelTitle = (panel: ComparisonPanel) => ({
    energy: "Energy consumption",
    co2: "CO₂ concentration by thermal zone",
    temperature: "Temperature by thermal zone",
    humidity: "Humidity by thermal zone",
    ventilation: "Ventilation / outdoor-air control",
    windowOpening: "Open windows analysis",
    greenWall: "Green wall analysis",
    thermalZones: "Building information",
    construction: "Compare Construction Sets",
  })[panel];
  const panelNeedsZone = (panel: ComparisonPanel) =>
    ["co2", "temperature", "humidity"].includes(panel);

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

        <div class="cozy-scrollbar min-h-0 overflow-y-auto pr-1">
          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <WorkspaceNavigationCard
              icon={Zap}
              title="Energy consumption"
              description="Heating, cooling and total HVAC use across time."
              onClick={() => setActivePanel("energy")}
            />
            <WorkspaceNavigationCard
              icon={Atom}
              title="CO₂ concentration"
              description="Inspect zone CO₂ levels and differences from the baseline."
              onClick={() => setActivePanel("co2")}
            />
            <WorkspaceNavigationCard
              icon={Thermometer}
              title="Temperature"
              description="Explore zone air temperature and its change from baseline."
              onClick={() => setActivePanel("temperature")}
            />
            <WorkspaceNavigationCard
              icon={Droplets}
              title="Humidity"
              description="Explore zone relative humidity and its change from baseline."
              onClick={() => setActivePanel("humidity")}
            />
            <WorkspaceNavigationCard
              icon={AirVent}
              title="Ventilation / outdoor-air control"
              description="Review the simulated outdoor-air fraction and ventilation control."
              onClick={() => setActivePanel("ventilation")}
            />
            <Show when={hasGreenWall()}>
              <WorkspaceNavigationCard
                icon={Leaf}
                title="Green wall analysis"
                description="Compare seasonal HVAC electricity and inspect each zone's plant parameters."
                onClick={() => setActivePanel("greenWall")}
              />
            </Show>
            <Show when={hasOpenWindows()}>
              <WorkspaceNavigationCard
                icon={Wind}
                title="Open windows analysis"
                description="Compare seasonal HVAC electricity and zone window-opening results."
                onClick={() => setActivePanel("windowOpening")}
              />
            </Show>
            <Show when={props.compared.some((item) => hasBuildingInformation(item.timesteps, item.analytics))}>
              <WorkspaceNavigationCard
                icon={MapPin}
                title="Building information"
                description="Review building metrics, thermal-zone geometry and occupants."
                onClick={() => setActivePanel("thermalZones")}
              />
            </Show>
            <WorkspaceNavigationCard
              icon={BrickWall}
              title="Compare Construction Sets"
              description="Review construction-set and material differences."
              onClick={() => setActivePanel("construction")}
            />
          </div>
        </div>
      </div>

      <Show when={analysisPlantId()}>
        {id => <PlantModelDialog plantId={id()} onClose={() => setAnalysisPlantId("")} />}
      </Show>
      <Show when={activePanel()} keyed>
        {(panel) => (
          <ComparisonAnalysisDialog
            title={panelTitle(panel)}
            onClose={() => setActivePanel(null)}
            constructionComparison={panel === "construction"}
          >
            <div
              class="min-h-0"
              classList={{
                "flex min-h-0 flex-1 flex-col": panel === "construction",
                "space-y-5": panel !== "construction",
              }}
            >
              <Show when={panelNeedsZone(panel)}>
                <ThermalZoneSelector
                  zones={panel === "windowOpening" ? zonesWithWindows() : thermalZones()}
                  selected={activeThermalZone()}
                  onSelect={setSelectedThermalZone}
                />
              </Show>

              <Switch>
                <Match when={panel === "energy"}>
                  <EnergyTotals compared={props.compared} />
                  <div class="mt-4 space-y-4">
                    <Chart title="Heating consumption">
                      <EChart option={meterOption(props.compared, "heating_electricity_j")} />
                    </Chart>
                    <Chart title="Cooling consumption">
                      <EChart option={meterOption(props.compared, "cooling_electricity_j")} />
                    </Chart>
                    <Chart title="Total HVAC consumption">
                      <EChart option={meterOption(props.compared, "hvac_electricity_j")} />
                    </Chart>
                    <Chart title="Total HVAC consumption difference (Compared − Baseline)">
                      <EChart
                        option={deltaHvacConsumptionOption(props.compared, props.analysis.baseline)}
                        class="h-[26rem] w-full sm:h-[30rem]"
                      />
                    </Chart>
                  </div>
                </Match>

                <Match when={panel === "co2"}>
                  <Show when={activeThermalZone()} keyed>
                    {(zone) => (
                      <div class="space-y-5">
                        <Co2AverageComparisonTable
                          baseline={props.analysis.baseline}
                          comparisons={activeZoneComparisons()}
                        />
                        <Chart title={`${zone} · CO₂ concentration`}>
                          <EChart option={zoneCo2Option(props.compared, zone)} class="h-[26rem] w-full sm:h-[30rem]" />
                        </Chart>
                        <section>
                          <div class="mb-3">
                            <h3 class="font-bold text-graphite">CO₂ difference (Compared − Baseline)</h3>
                            <p class="mt-1 text-xs text-graphite/50">
                              Compared − Baseline: negative values mean lower CO₂ in the compared simulation.
                            </p>
                          </div>
                          <Show when={activeZoneComparisons().length > 0}>
                            <Chart title={`${zone} · ΔCO₂ comparison`}>
                              <EChart
                                option={deltaCo2Option(props.analysis.baseline, activeZoneComparisons(), props.analysis.plantConfigurations)}
                                class="h-[26rem] w-full sm:h-[30rem]"
                              />
                            </Chart>
                          </Show>
                        </section>
                      </div>
                    )}
                  </Show>
                </Match>

                <Match when={panel === "temperature"}>
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
                </Match>

                <Match when={panel === "humidity"}>
                  <Show when={activeThermalZone()} keyed>
                    {(zone) => (
                      <div class="space-y-8">
                        <section>
                          <h3 class="mb-2 font-bold text-graphite">Relative humidity</h3>
                          <p class="mb-3 text-xs text-graphite/55">
                            Values compare the selected zone with the baseline at matching timestamps. Positive differences mean higher relative humidity.
                          </p>
                          <ThermalZoneMetricComparisonView
                            compared={props.compared}
                            baseline={props.analysis.baseline}
                            zone={zone}
                            metric="relativeHumidity"
                          />
                        </section>
                      </div>
                    )}
                  </Show>
                </Match>

                <Match when={panel === "ventilation"}>
                  <VentilationOutdoorAirControl
                    compared={props.compared}
                    baseline={props.analysis.baseline}
                  />
                </Match>

                <Match when={panel === "greenWall"}>
                  <SeasonalEnergyAnalysis compared={props.compared} baseline={props.analysis.baseline} showHeatingCoolingPercent />
                  <section class="mt-6 space-y-4">
                    <ThermalZoneSelector zones={thermalZones()} selected={activeThermalZone()} onSelect={setSelectedThermalZone} />
                    <Show when={activeThermalZone()} keyed>
                      {zone => <>
                        <GreenWallParameters
                          compared={props.compared}
                          configurations={props.analysis.plantConfigurations}
                          baseline={props.analysis.baseline}
                          zone={zone}
                          onPreview={setAnalysisPlantId}
                        />
                      </>}
                    </Show>
                  </section>
                </Match>
                <Match when={panel === "windowOpening"}>
                  <SeasonalEnergyAnalysis compared={props.compared} baseline={props.analysis.baseline} />
                  <div class="my-5">
                    <ThermalZoneSelector zones={zonesWithWindows()} selected={activeThermalZone()} onSelect={setSelectedThermalZone} />
                  </div>
                  <Show when={activeThermalZone()} keyed fallback={
                    <p class="rounded-xl border border-warm-stone/20 bg-cloud-white p-4 text-sm text-graphite/60">
                      No window-opening data is available for these simulations.
                    </p>
                  }>
                    {(zone) => (
                      <WindowOpeningAnalysis compared={props.compared} zone={zone} />
                    )}
                  </Show>
                </Match>

                <Match when={panel === "thermalZones"}>
                  <div class="space-y-5">
                    <For each={props.compared}>
                      {(item) => (
                        <Show when={hasBuildingInformation(item.timesteps, item.analytics)}>
                          <BuildingInformation
                            simulation={item.simulation}
                            timesteps={item.timesteps}
                            analytics={item.analytics}
                          />
                        </Show>
                      )}
                    </For>
                  </div>
                </Match>

                <Match when={panel === "construction"}>
                  <ConstructionSetComparison
                    simulations={props.compared.map((item) => item.simulation)}
                    scrollCardsOnly
                  />
                </Match>
              </Switch>
            </div>
          </ComparisonAnalysisDialog>
        )}
      </Show>
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

function ThermalZoneSelector(props: {
  zones: string[];
  selected: string;
  onSelect: (zone: string) => void;
}) {
  return (
    <section class="rounded-2xl border border-warm-stone/20 bg-sky-mist/15 p-4">
      <h3 class="mb-3 text-sm font-bold text-graphite">Thermal zone</h3>
      <div class="flex flex-wrap gap-2" aria-label="Select thermal zone">
        <For each={props.zones}>
          {(zone) => (
            <button
              type="button"
              aria-pressed={props.selected === zone}
              onClick={() => props.onSelect(zone)}
              class="rounded-full border px-3 py-2 text-xs font-semibold transition"
              classList={{
                "border-citadel-blue bg-citadel-blue text-cloud-white shadow-sm": props.selected === zone,
                "border-warm-stone/25 bg-cloud-white text-graphite/65 hover:border-citadel-blue/45 hover:bg-sky-mist/25": props.selected !== zone,
              }}
            >
              {zone}
            </button>
          )}
        </For>
      </div>
    </section>
  );
}

function ComparisonAnalysisDialog(props: {
  title: string;
  onClose: () => void;
  children: unknown;
  constructionComparison?: boolean;
}) {
  let dialog!: HTMLDialogElement;
  onMount(() => dialog.showModal());
  const close = () => {
    if (dialog.open) dialog.close();
    else props.onClose();
  };
  return (
    <Portal>
      <dialog
        ref={dialog}
        aria-label={props.title}
        onClose={props.onClose}
        onClick={(event) => { if (event.target === dialog) close(); }}
        class="m-auto flex h-[min(56rem,92dvh)] w-[min(88rem,96vw)] max-w-none flex-col overflow-hidden rounded-3xl border border-warm-stone/20 bg-cloud-white p-0 shadow-2xl backdrop:bg-black/50"
      >
        <header class="relative shrink-0 border-b border-citadel-blue/10 bg-sky-mist/30 px-6 py-4 pr-14">
          <p class="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-citadel-blue">Simulation analysis</p>
          <h2 class="mt-1 text-lg font-bold text-graphite">{props.title}</h2>
          <button
            type="button"
            aria-label="Close analysis"
            onClick={close}
            class="absolute right-4 top-4 rounded-lg p-1 text-graphite/55 hover:bg-sky-mist/40"
          >
            <X class="size-5" />
          </button>
        </header>
        <div
          class="cozy-scrollbar min-h-0 flex-1 p-4 sm:p-6"
          classList={{
            "flex flex-col overflow-hidden": props.constructionComparison,
            "overflow-y-auto": !props.constructionComparison,
          }}
        >
          {props.children as any}
        </div>
      </dialog>
    </Portal>
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
              <th class="p-3">Δ Heating %</th>
              <th class="p-3">Cooling</th>
              <th class="p-3">Δ Cooling</th>
              <th class="p-3">Δ Cooling %</th>
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
                    <td class="p-3">
                      {delta(metrics.totalHeatingKwhDeltaPercent, "%")}
                    </td>
                    <td class="p-3">{metric(metrics.totalCoolingKwh, "kWh")}</td>
                    <td class="p-3">
                      {delta(metrics.totalCoolingKwhDelta, "kWh")}
                    </td>
                    <td class="p-3">
                      {delta(metrics.totalCoolingKwhDeltaPercent, "%")}
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
            Baseline minus each simulation at matching timestamps, displayed with the % symbol.
          </p>
          <EChart option={deltaOutdoorAirFractionOption(props.compared, props.baseline)} />
        </Chart>
      </div>
    </>
  );
}

function WindowOpeningAnalysis(props: {
  compared: ComparedSimulation[];
  zone: string;
}) {
  return (
    <div class="space-y-4">
      <WindowOpeningSummary compared={props.compared} zone={props.zone} />
      <Chart title={`${props.zone} · window opening`}>
        <EChart option={zoneWindowOption(props.compared, props.zone)} />
      </Chart>
    </div>
  );
}

function WindowOpeningSummary(props: {
  compared: ComparedSimulation[];
  zone: string;
}) {
  const deltaPercent = (value: number | null | undefined) =>
    typeof value === "number" && Number.isFinite(value)
      ? `${value >= 0 ? "+" : ""}${number(value)} %`
      : "—";
  return (
    <section class="overflow-hidden rounded-2xl border border-warm-stone/20 bg-cloud-white">
      <div class="border-b border-citadel-blue/10 bg-sky-mist/30 px-4 py-3 sm:px-5">
        <h3 class="font-bold text-graphite">Window opening</h3>
        <p class="mt-1 text-xs text-graphite/50">
          Average opening factor across the selected zone’s windows and timesteps, including closed windows. This is not the percentage of time windows were open. Total openable area is the full area available in this zone. Δ is the relative change from baseline; a missing or zero baseline has no defined percentage.
        </p>
      </div>
      <div class="cozy-scrollbar overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-sky-mist/25 text-left text-xs uppercase tracking-wide text-graphite/50">
            <tr>
              <th class="p-3">Simulation</th>
              <th class="p-3">Window-opening strategy</th>
              <th class="p-3">Total openable window area (m²)</th>
              <th class="p-3">Mean window opening (%)</th>
              <th class="p-3">Δ vs baseline (%)</th>
            </tr>
          </thead>
          <tbody>
            <For each={props.compared}>
              {(item) => {
                const value =
                  item.analytics.zones[props.zone]?.meanWindowOpeningPercent;
                const delta =
                  item.analytics.zones[props.zone]?.meanWindowOpeningDeltaPercent;
                return (
                  <tr class="border-t border-warm-stone/10">
                    <td class="p-3 font-bold text-graphite">
                      {item.simulation.name}
                    </td>
                    <td class="whitespace-nowrap p-3">
                      {windowStrategyLabel(item.simulation)}
                    </td>
                    <td class="whitespace-nowrap p-3">
                      {metric(item.analytics.zones[props.zone]?.openable_window_area_m2, "m²")}
                    </td>
                    <td class="p-3">
                      {typeof value === "number" && Number.isFinite(value)
                        ? `${number(value)} %`
                        : "—"}
                    </td>
                    <td class="p-3">{deltaPercent(delta)}</td>
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

export function ThermalZoneOverview(props: {
  compared: ComparedSimulation[];
  plantConfigurations: ComparisonPlantConfiguration[];
}) {
  const valueWithUnit = (
    value: number | null | undefined,
    unit: string,
  ) =>
    typeof value === "number" && Number.isFinite(value)
      ? `${number(value)} ${unit}`
      : "—";

  return (
    <div class="space-y-5">
      <p class="text-xs text-graphite/55">
        Occupancy and CO₂ setpoints are averaged over weekdays, 08:00–22:00. Heating and cooling metrics are left out until their schedule and setback interpretation is agreed.
      </p>
      <For each={props.compared}>
        {(item) => {
          const zones = Object.entries(item.analytics.zones).sort(
            ([left], [right]) => left.localeCompare(right),
          );
          const metrics = item.analytics.metrics;
          const plantConfiguration = props.plantConfigurations.find(
            (configuration) =>
              configuration.simulationId === item.simulation.id,
          );
          return (
            <article class="overflow-hidden rounded-2xl border border-warm-stone/20 bg-cloud-white">
              <header class="border-b border-citadel-blue/10 bg-sky-mist/30 px-4 py-3 sm:px-5">
                <h3 class="font-bold text-graphite">{item.simulation.name}</h3>
              </header>

              <section class="p-4 sm:p-5">
                <h4 class="mb-3 text-sm font-bold text-graphite">Zones</h4>
                <div class="cozy-scrollbar overflow-x-auto rounded-xl border border-warm-stone/20">
                  <table class="min-w-[98rem] w-full text-sm">
                    <thead class="bg-sky-mist/25 text-left text-xs uppercase tracking-wide text-graphite/50">
                      <tr>
                        <th class="p-3">Thermal zone</th>
                        <th class="p-3">Floor area</th>
                        <th class="p-3">Net wall area</th>
                        <th class="p-3">Air volume</th>
                        <th class="p-3">Openable windows</th>
                        <th class="p-3">Openable window area</th>
                        <th class="p-3">Mean occupants · weekdays 08:00–22:00</th>
                        <th class="p-3">Mean CO₂ setpoint · weekdays 08:00–22:00</th>
                        <th class="p-3">PPFD</th>
                        <th class="p-3">Total leaf area</th>
                        <th class="p-3">Mean PARleaf</th>
                      </tr>
                    </thead>
                    <tbody>
                      <Show
                        when={zones.length > 0}
                        fallback={
                          <tr>
                            <td class="p-3 text-graphite/55" colSpan={11}>
                              No thermal-zone data is available for this simulation.
                            </td>
                          </tr>
                        }
                      >
                        <For each={zones}>
                          {([zoneName, zone]) => (
                            <tr class="border-t border-warm-stone/10">
                              <td class="p-3 font-semibold text-graphite">{zoneName}</td>
                              <td class="whitespace-nowrap p-3">{valueWithUnit(zone.floor_area_m2, "m²")}</td>
                              <td class="whitespace-nowrap p-3">{valueWithUnit(zone.net_wall_area_m2, "m²")}</td>
                              <td class="whitespace-nowrap p-3">{valueWithUnit(zone.air_volume_m3, "m³")}</td>
                              <td class="whitespace-nowrap p-3">{typeof zone.openable_window_count === "number" ? `${Math.round(zone.openable_window_count)} windows` : "—"}</td>
                              <td class="whitespace-nowrap p-3">{valueWithUnit(zone.openable_window_area_m2, "m²")}</td>
                              <td class="whitespace-nowrap p-3">{valueWithUnit(zone.meanOccupantsWeekdays08To22, "people")}</td>
                              <td class="whitespace-nowrap p-3">{valueWithUnit(zone.meanCo2SetpointPpmWeekdays08To22, "ppm")}</td>
                              <td class="whitespace-nowrap p-3">{scientificValue(plantConfiguration?.ppfdUmolM2S, "μmol·m⁻²·s⁻¹")}</td>
                              <td class="whitespace-nowrap p-3">{valueWithUnit(zone.totalLeafAreaM2, "m²")}</td>
                              <td class="whitespace-nowrap p-3">{scientificValue(plantConfiguration?.meanParLeafUmolM2S, "μmol·m⁻²·s⁻¹")}</td>
                            </tr>
                          )}
                        </For>
                      </Show>
                    </tbody>
                  </table>
                </div>
              </section>

              <section class="border-t border-warm-stone/10 px-4 pb-4 sm:px-5 sm:pb-5">
                <h4 class="mb-3 text-sm font-bold text-graphite">Whole building</h4>
                <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <ZoneOverviewMetric
                    label="Total floor area"
                    value={valueWithUnit(metrics.totalFloorAreaM2, "m²")}
                  />
                  <ZoneOverviewMetric
                    label="Net wall area"
                    value={valueWithUnit(metrics.totalNetWallAreaM2, "m²")}
                  />
                  <ZoneOverviewMetric
                    label="Total air volume"
                    value={valueWithUnit(metrics.totalVolumeM3, "m³")}
                  />
                  <ZoneOverviewMetric
                    label="Total openable windows"
                    value={typeof metrics.totalOpenableWindowCount === "number"
                      ? `${Math.round(metrics.totalOpenableWindowCount)} windows`
                      : "—"}
                  />
                  <ZoneOverviewMetric
                    label="Total openable window area"
                    value={valueWithUnit(metrics.totalOpenableWindowAreaM2, "m²")}
                  />
                  <ZoneOverviewMetric
                    label="Total leaf area"
                    value={valueWithUnit(metrics.totalLeafAreaM2, "m²")}
                  />
                  <ZoneOverviewMetric
                    label="Mean occupants · weekdays 08:00–22:00"
                    value={valueWithUnit(metrics.meanOccupantsWeekdays08To22, "people")}
                  />
                </div>
              </section>
            </article>
          );
        }}
      </For>
    </div>
  );
}

function ZoneOverviewMetric(props: { label: string; value: string }) {
  return (
    <div class="rounded-xl border border-warm-stone/20 bg-sky-mist/10 px-3 py-3">
      <p class="text-[0.65rem] font-semibold uppercase tracking-wide text-graphite/50">
        {props.label}
      </p>
      <p class="mt-1 font-bold text-graphite">{props.value}</p>
    </div>
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

function deltaHvacConsumptionOption(
  compared: ComparedSimulation[],
  baseline: SimulationReference,
): EChartsOption {
  const baselineSimulation = compared.find(
    (item) => item.simulation.id === baseline.id,
  );
  const baselineValues = new Map<number, number>();
  for (const timestep of baselineSimulation?.timesteps ?? []) {
    const timestamp = timestep.simulation_timestamp
      ? Date.parse(timestep.simulation_timestamp)
      : NaN;
    const value = timestep.results?.meter_results?.hvac_electricity_kwh;
    if (
      Number.isFinite(timestamp) &&
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      baselineValues.set(timestamp, value);
    }
  }

  const alternatives = compared.filter(
    (item) => item.simulation.id !== baseline.id,
  );
  const names = alternatives.map(
    (item) => `${item.simulation.name} − ${baseline.name}`,
  );
  return {
    color: alternatives.map((_, index) => colors[(index + 1) % colors.length]),
    tooltip: { trigger: "axis" },
    legend: { data: names, bottom: 0, type: "scroll", selectedMode: true },
    grid: { left: 72, right: 18, top: 24, bottom: 108 },
    xAxis: { type: "time", axisLabel: { hideOverlap: true } },
    yAxis: { type: "value", name: "Compared − baseline [kWh / timestep]" },
    dataZoom: [{ type: "inside" }, { type: "slider", height: 18, bottom: 38 }],
    series: alternatives.map((item, index) => ({
      id: item.simulation.id,
      name: names[index],
      type: "line",
      showSymbol: false,
      data: item.timesteps.flatMap((timestep) => {
        const timestamp = timestep.simulation_timestamp
          ? Date.parse(timestep.simulation_timestamp)
          : NaN;
        const comparedValue = timestep.results?.meter_results?.hvac_electricity_kwh;
        const baselineValue = baselineValues.get(timestamp);
        if (
          !Number.isFinite(timestamp) ||
          typeof comparedValue !== "number" ||
          !Number.isFinite(comparedValue) ||
          baselineValue === undefined
        ) {
          return [];
        }
        return [[timestamp, comparedValue - baselineValue]];
      }),
      markLine: index === 0
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

type ThermalZoneMetric = "temperature" | "relativeHumidity";
type ThermalZoneMetricField = "zone_air_temp_c" | "relative_humidity_percent";

function thermalZoneMetricConfig(metric: ThermalZoneMetric) {
  if (metric === "temperature") {
    return {
      field: "zone_air_temp_c" as const,
      label: "Zone air temperature",
      unit: "°C",
      deltaUnit: "°C",
      deltaAxis: "Zone air temperature change vs baseline [°C]",
      deltaDescription: "Positive values mean the compared simulation is warmer than the baseline.",
      differenceLabel: "Δ vs baseline",
    };
  }
  if (metric === "relativeHumidity") {
    return {
      field: "relative_humidity_percent" as const,
      label: "Relative humidity",
      unit: "%",
      deltaUnit: "%",
      deltaAxis: "Relative humidity difference from baseline [%]",
      deltaDescription: "Compared relative humidity minus baseline relative humidity at matching timestamps.",
      differenceLabel: "Δ RH (%)",
    };
  }
  return {
    field: "zone_air_temp_c" as const,
    label: "Zone air temperature",
    unit: "°C",
    deltaUnit: "°C",
    deltaAxis: "Zone air temperature change vs baseline [°C]",
    deltaDescription: "Positive values mean the compared simulation is warmer than the baseline.",
    differenceLabel: "Δ vs baseline",
  };
}

function zoneMetricDifference(
  baselineValue: number,
  comparedValue: number,
): number | null {
  return comparedValue - baselineValue;
}

function zoneMetricValue(
  timestep: SimulationTimestep | undefined,
  zone: string,
  field: ThermalZoneMetricField,
): number | null {
  const value = timestep?.results?.zone_results?.[zone]?.[field];
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
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
          ? (() => {
              const difference = zoneMetricDifference(baselineValue, value);
              return difference === null ? [] : [[timestamp, difference]];
            })()
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
      ? (() => {
          const difference = zoneMetricDifference(baselineValue, value);
          return difference === null ? [] : [difference];
        })()
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
  const hasData = () => props.compared.some((item) =>
    item.timesteps.some((timestep) => zoneMetricValue(timestep, props.zone, config().field) !== null),
  );
  const summaries = () => props.compared.map((item) => ({
    item,
    values: summarize(item.timesteps.map((timestep) => zoneMetricValue(timestep, props.zone, config().field))),
    deltas: summarize(pairedZoneMetricDeltas(baseline(), item, props.zone, config().field)),
  }));
  const display = (value: number | null | undefined, unit = config().unit) =>
    typeof value === "number" && Number.isFinite(value)
      ? `${number(value)}\u00a0${unit}`
      : "—";
  const summaryTable = () => (
    <section>
      <h3 class="mb-3 font-bold text-graphite">Summary metrics</h3>
      <div class="cozy-scrollbar overflow-x-auto rounded-2xl border border-warm-stone/20">
        <table class="min-w-full text-sm">
          <thead class="bg-sky-mist/25 text-left text-xs uppercase tracking-wide text-graphite/50">
            <tr>
              <th class="p-3">Simulation</th><th class="p-3">Mean</th><th class="p-3">Maximum</th><th class="p-3">Minimum</th>
              <th class="p-3">Mean {config().differenceLabel}</th><th class="p-3">Maximum {config().differenceLabel}</th><th class="p-3">Minimum {config().differenceLabel}</th>
            </tr>
          </thead>
          <tbody>
            <For each={summaries()}>
              {(summary) => (
                <tr class="border-t border-warm-stone/10">
                  <td class="p-3 font-semibold text-graphite">{summary.item.simulation.name}{summary.item.simulation.id === props.baseline.id ? " · baseline" : ""}</td>
                  <td class="whitespace-nowrap p-3">{display(summary.values?.mean)}</td><td class="whitespace-nowrap p-3">{display(summary.values?.max)}</td><td class="whitespace-nowrap p-3">{display(summary.values?.min)}</td>
                  <td class="whitespace-nowrap p-3">{summary.item.simulation.id === props.baseline.id ? display(0, config().deltaUnit) : display(summary.deltas?.mean, config().deltaUnit)}</td>
                  <td class="whitespace-nowrap p-3">{summary.item.simulation.id === props.baseline.id ? display(0, config().deltaUnit) : display(summary.deltas?.max, config().deltaUnit)}</td>
                  <td class="whitespace-nowrap p-3">{summary.item.simulation.id === props.baseline.id ? display(0, config().deltaUnit) : display(summary.deltas?.min, config().deltaUnit)}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </section>
  );

  return (
    <Show
      when={hasData()}
      fallback={
        <p class="rounded-xl border border-dashed border-warm-stone/30 bg-sky-mist/10 p-4 text-sm text-graphite/60">
          {`${config().label} data is not available for this zone in the selected simulations.`}
        </p>
      }
    >
    <div class="space-y-5">
      {summaryTable()}
      <Show when={props.metric === "temperature"} fallback={
        <Chart title={`${props.zone} · ${config().label}`}>
          <EChart option={zoneMetricOption(props.compared, props.zone, config().field, config().unit)} class="h-[26rem] w-full sm:h-[30rem]" />
        </Chart>
      }>
        <TemperatureComparisonChart compared={props.compared} zone={props.zone} baseline={props.baseline} />
      </Show>
      <Show when={props.compared.length > 1}>
        <section>
          <div class="mb-3">
            <h3 class="font-bold text-graphite">Difference against baseline</h3>
            <p class="mt-1 text-xs text-graphite/50">
              {config().deltaDescription} Values are matched by timestamp.
            </p>
          </div>
          <Chart title={`${props.zone} · difference from baseline`}>
            <EChart option={deltaZoneMetricOption(props.compared, props.baseline.id, props.zone, config().field, config().deltaAxis)} class="h-[26rem] w-full sm:h-[30rem]" />
          </Chart>
        </section>
      </Show>
      <Show when={props.metric === "temperature"}>
        <TemperatureSetpointsTable compared={props.compared} baseline={props.baseline} />
      </Show>
    </div>
    </Show>
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

function Co2AverageComparisonTable(props: {
  baseline: SimulationReference;
  comparisons: Array<{
    comparison: ScenarioComparison;
    zone: ThermalZoneComparison;
  }>;
}) {
  const baselineSummary = () => props.comparisons[0]?.zone.summary;
  const rows = () => [
    {
      simulation: props.baseline.name,
      baseline: true,
      all: baselineSummary()?.averageCo2?.baselinePpm,
      daytime: baselineSummary()?.daytimeWeekdayAverageCo2?.baselinePpm,
      nighttime: baselineSummary()?.nightWeekdayAverageCo2?.baselinePpm,
      allDifference: 0,
      daytimeDifference: 0,
      nighttimeDifference: 0,
    },
    ...props.comparisons.map(({ comparison, zone }) => ({
      simulation: comparison.simulation.name,
      baseline: false,
      all: zone.summary.averageCo2?.comparedPpm,
      daytime: zone.summary.daytimeWeekdayAverageCo2?.comparedPpm,
      nighttime: zone.summary.nightWeekdayAverageCo2?.comparedPpm,
      allDifference: zone.summary.averageCo2?.differencePercent,
      daytimeDifference:
        zone.summary.daytimeWeekdayAverageCo2?.differencePercent,
      nighttimeDifference:
        zone.summary.nightWeekdayAverageCo2?.differencePercent,
    })),
  ];
  const ppm = (value: number | null | undefined) =>
    typeof value === "number" && Number.isFinite(value)
      ? `${number(value)} ppm`
      : "—";
  const percent = (value: number | null | undefined) =>
    typeof value === "number" && Number.isFinite(value)
      ? `${value > 0 ? "+" : ""}${number(value)} %`
      : "—";

  return (
    <section class="overflow-hidden rounded-2xl border border-warm-stone/20 bg-cloud-white">
      <div class="border-b border-citadel-blue/10 bg-sky-mist/30 px-4 py-3 sm:px-5">
        <h3 class="font-bold text-graphite">Average CO₂ comparison</h3>
        <p class="mt-1 text-xs text-graphite/50">
          Average zone concentration and percentage change from baseline. Negative percentages mean lower CO₂ in the compared simulation.
        </p>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[60rem] border-separate border-spacing-0 text-left text-xs">
          <thead class="bg-sky-mist/25 text-graphite/55">
            <tr>
              <th rowSpan={2} class="border-b border-warm-stone/20 p-3 font-bold">
                Simulation
              </th>
              <th colSpan={2} class="border-b border-warm-stone/20 p-3 text-center font-bold">
                All hours
              </th>
              <th colSpan={2} class="border-b border-warm-stone/20 p-3 text-center font-bold">
                Weekdays · 08:00–22:00
              </th>
              <th colSpan={2} class="border-b border-warm-stone/20 p-3 text-center font-bold">
                Weekdays · 22:00–08:00
              </th>
            </tr>
            <tr>
              <th class="border-b border-warm-stone/20 p-3 font-semibold">Mean CO₂</th>
              <th class="border-b border-warm-stone/20 p-3 font-semibold">Δ vs baseline</th>
              <th class="border-b border-warm-stone/20 p-3 font-semibold">Mean CO₂</th>
              <th class="border-b border-warm-stone/20 p-3 font-semibold">Δ vs baseline</th>
              <th class="border-b border-warm-stone/20 p-3 font-semibold">Mean CO₂</th>
              <th class="border-b border-warm-stone/20 p-3 font-semibold">Δ vs baseline</th>
            </tr>
          </thead>
          <tbody>
            <For each={rows()}>
              {(row) => (
                <tr classList={{ "bg-sky-mist/10": row.baseline }}>
                  <th class="border-b border-warm-stone/10 p-3 font-semibold text-graphite">
                    {row.simulation}
                    <Show when={row.baseline}>
                      <span class="ml-2 text-[0.62rem] font-bold uppercase tracking-wide text-citadel-blue">
                        Baseline
                      </span>
                    </Show>
                  </th>
                  <td class="border-b border-warm-stone/10 p-3 font-semibold text-graphite">{ppm(row.all)}</td>
                  <td class="border-b border-warm-stone/10 p-3 font-semibold text-graphite">{percent(row.allDifference)}</td>
                  <td class="border-b border-warm-stone/10 p-3 font-semibold text-graphite">{ppm(row.daytime)}</td>
                  <td class="border-b border-warm-stone/10 p-3 font-semibold text-graphite">{percent(row.daytimeDifference)}</td>
                  <td class="border-b border-warm-stone/10 p-3 font-semibold text-graphite">{ppm(row.nighttime)}</td>
                  <td class="border-b border-warm-stone/10 p-3 font-semibold text-graphite">{percent(row.nighttimeDifference)}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </section>
  );
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
    return `${comparedLabel} − ${baseline.name}`;
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
    yAxis: { type: "value", name: "Compared − Baseline [ppm]" },
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
  const strategy = windowStrategyLabel(simulation);
  return `${strategy} · ${windows.co2ThresholdPpm} ppm · ±${windows.temperatureMarginC} °C`;
}

function windowStrategyLabel(simulation: SimulationListItem) {
  const windows = simulation.openWindows;
  if (!windows) return "Disabled";
  if (windows.openingStrategy === "FIXED_PERCENTAGE") {
    return typeof windows.openingPercentage === "number"
      ? `Fixed · ${number(windows.openingPercentage)} %`
      : "Fixed";
  }
  return windows.openingStrategy === "ON_OFF" ? "On–Off" : "Linear";
}

function co2ControlLabel(simulation: SimulationListItem) {
  const control = simulation.co2Control;
  if (!control) return "CO₂ control disabled";
  return `Mechanical ventilation DCV · ${control.setpointPpm} ppm`;
}
