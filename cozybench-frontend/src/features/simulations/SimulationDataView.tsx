import type { EChartsOption } from "echarts";
import { createQuery } from "@tanstack/solid-query";
import { loadSimulationAnalytics } from "./simulationsService";
import {
  AirVent,
  Atom,
  BrickWall,
  Droplets,
  Eye,
  Leaf,
  MapPin,
  Thermometer,
  Wind,
  X,
  Zap,
} from "lucide-solid";
import {
  For,
  Match,
  Show,
  Switch,
  createEffect,
  createMemo,
  createSignal,
  lazy,
  onMount,
  Suspense,
} from "solid-js";
import { Portal } from "solid-js/web";
import WorkspaceNavigationCard from "../../components/building-dt/WorkspaceNavigationCard";
import { hasBuildingInformation } from "./BuildingInformation";
import SimulationSetupCard from "./SimulationSetupCard";
import {
  timestampLabel,
  zoneAt,
  zoneNames,
} from "./simulationAnalytics";
import type {
  PlantSimulation,
  SimulationListItem,
  SimulationTimestep,
} from "./simulationsService";

const COLORS = ["#3C6F8F", "#641D16", "#4D4936"];
const PlantModelDialog = lazy(() => import("../plant-dt/PlantModelDialog"));
const EChart = lazy(() => import("../../components/charts/EChart"));
const ConstructionSetComparison = lazy(() => import("./ConstructionSetComparison"));
const BuildingInformation = lazy(() => import("./BuildingInformation"));
const SeasonalEnergyAnalysis = lazy(() => import("./SeasonalEnergyAnalysis"));

type AnalysisPanel =
  | "energy"
  | "co2"
  | "temperature"
  | "humidity"
  | "ventilation"
  | "greenWall"
  | "windowOpening"
  | "thermalZones"
  | "construction";

export default function SimulationDataView(props: {
  simulation: SimulationListItem;
  timesteps: SimulationTimestep[];
}) {
  const [selectedZone, setSelectedZone] = createSignal("");
  const [activePanel, setActivePanel] = createSignal<AnalysisPanel | null>(null);
  const [previewPlantId, setPreviewPlantId] = createSignal("");
  const zones = createMemo(() => zoneNames(props.timesteps));
  const windowZones = createMemo(() => {
    const names = new Set<string>();
    props.timesteps.forEach((timestep) => {
      Object.entries(timestep.results?.window_opening_results ?? {}).forEach(
        ([key, result]) => names.add(result.zone_name || key),
      );
    });
    return [...names].sort((left, right) => left.localeCompare(right));
  });
  const selectableZones = () =>
    activePanel() === "windowOpening" ? windowZones() : zones();
  const timestamps = () => props.timesteps.map(timestampLabel);
  const zoneSteps = () =>
    props.timesteps.map((step) => zoneAt(step, selectedZone()));
  const energyAnalytics = createQuery(() => ({
    queryKey: ["simulation-analytics", props.simulation.id, props.timesteps.length],
    queryFn: () =>
      loadSimulationAnalytics(props.simulation.id, 0, props.timesteps.length),
    enabled: activePanel() !== null && props.timesteps.length > 0,
    // Analytics for a completed simulation is immutable; retain it while the
    // user opens and closes analysis cards.
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  }));
  const energyMetrics = () => energyAnalytics.data?.metrics ?? {};

  createEffect(() => {
    if (!selectableZones().includes(selectedZone())) {
      setSelectedZone(selectableZones()[0] ?? "");
    }
  });

  const heatingOption = createMemo<EChartsOption>(() =>
    activePanel() === "energy" ? chartOption(timestamps(), "kWh / timestep", [
      line(
        "Heating",
        props.timesteps.map((step) =>
          step.results?.meter_results?.heating_electricity_kwh ?? null,
        ),
      ),
    ]) : {},
  );
  const coolingOption = createMemo<EChartsOption>(() =>
    activePanel() === "energy" ? chartOption(timestamps(), "kWh / timestep", [
      line(
        "Cooling",
        props.timesteps.map((step) =>
          step.results?.meter_results?.cooling_electricity_kwh ?? null,
        ),
      ),
    ]) : {},
  );
  const totalHvacOption = createMemo<EChartsOption>(() =>
    activePanel() === "energy" ? chartOption(timestamps(), "kWh / timestep", [
      line(
        "Total HVAC",
        props.timesteps.map((step) =>
          step.results?.meter_results?.hvac_electricity_kwh ?? null,
        ),
      ),
    ]) : {},
  );
  const temperatureOption = createMemo<EChartsOption>(() =>
    activePanel() === "temperature" ? chartOption(timestamps(), "°C", [
      line(
        "Air temperature",
        zoneSteps().map((value) => value?.zone_air_temp_c),
      ),
    ]) : {},
  );
  const co2Option = createMemo<EChartsOption>(() =>
    activePanel() === "co2" ? chartOption(timestamps(), "ppm", [
      line(
        "Zone CO₂ concentration",
        zoneSteps().map((value) => value?.co2_concentration_ppm),
      ),
    ]) : {},
  );
  const humidityOption = createMemo<EChartsOption>(() =>
    activePanel() === "humidity" ? chartOption(timestamps(), "%", [
      line(
        "Relative humidity",
        zoneSteps().map((value) => value?.relative_humidity_percent),
      ),
    ]) : {},
  );
  const ventilationOption = createMemo<EChartsOption>(() =>
    activePanel() === "ventilation" ? chartOption(timestamps(), "%", [
      line(
        "Outdoor-air flow",
        props.timesteps.map((step) => {
          const results = step.results;
          return (
            results?.outdoor_air_flow_percent ??
            (typeof results?.outdoor_air_flow_fraction === "number"
              ? results.outdoor_air_flow_fraction * 100
              : null)
          );
        }),
      ),
    ]) : {},
  );
  const windowOpeningOption = createMemo<EChartsOption>(() =>
    activePanel() === "windowOpening" ? chartOption(timestamps(), "%", [
      line(
        "Mean window opening",
        props.timesteps.map((step) =>
          windowOpeningPercent(step, selectedZone()),
        ),
      ),
    ]) : {},
  );
  const panelTitle = (panel: AnalysisPanel) =>
    ({
      energy: "Energy consumption",
      co2: "CO₂ concentration",
      temperature: "Temperature",
      humidity: "Humidity",
      ventilation: "Ventilation / outdoor-air control",
      greenWall: "Green wall analysis",
      windowOpening: "Open windows analysis",
      thermalZones: "Building information",
      construction: "Construction Set",
    })[panel];
  return (
    <Show when={props.timesteps.length > 0} fallback={<EmptyState />}>
      <div class="relative flex h-full min-h-0 flex-col">
        <div class="relative z-20 shrink-0 px-4 pt-4 pb-4 sm:px-5 sm:pt-5 sm:pb-4">
          <SimulationSetupCard simulation={props.simulation} />
        </div>

        <div class="cozy-scrollbar relative z-0 min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-5 sm:pb-5">
          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <WorkspaceNavigationCard icon={Zap} title="Energy consumption" description="Heating, cooling and total HVAC use across time." onClick={() => setActivePanel("energy")} />
            <WorkspaceNavigationCard icon={Atom} title="CO₂ concentration" description="Inspect zone CO₂ levels and trends across time." onClick={() => setActivePanel("co2")} />
            <WorkspaceNavigationCard icon={Thermometer} title="Temperature" description="Explore zone air temperature throughout the simulation." onClick={() => setActivePanel("temperature")} />
            <WorkspaceNavigationCard icon={Droplets} title="Humidity" description="Explore zone relative humidity throughout the simulation." onClick={() => setActivePanel("humidity")} />
            <Show when={props.simulation.co2Control}>
              <WorkspaceNavigationCard icon={AirVent} title="Ventilation / outdoor-air control" description="Review the simulated outdoor-air fraction and ventilation control." onClick={() => setActivePanel("ventilation")} />
            </Show>
            <Show when={props.simulation.plantSimulation}>
              <WorkspaceNavigationCard icon={Leaf} title="Green wall analysis" description="Inspect the green-wall configuration and plant CO₂ exchange." onClick={() => setActivePanel("greenWall")} />
            </Show>
            <Show when={props.simulation.openWindows}>
              <WorkspaceNavigationCard icon={Wind} title="Open windows analysis" description="Review zone window-opening results across the simulation." onClick={() => setActivePanel("windowOpening")} />
            </Show>
            <Show when={hasBuildingInformation(props.timesteps)}>
              <WorkspaceNavigationCard icon={MapPin} title="Building information" description="Review building metrics, thermal-zone geometry and occupants." onClick={() => setActivePanel("thermalZones")} />
            </Show>
            <WorkspaceNavigationCard icon={BrickWall} title="Construction Set" description="Review the construction set and material details used by this simulation." onClick={() => setActivePanel("construction")} />
          </div>
        </div>

        <Show when={activePanel()} keyed>
          {(panel) => (
            <AnalysisDialog title={panelTitle(panel)} onClose={() => setActivePanel(null)}>
              <Show when={["co2", "temperature", "humidity", "windowOpening"].includes(panel)}>
                <ZoneSelector
                  zones={panel === "windowOpening" ? windowZones() : zones()}
                  selected={selectedZone()}
                  onSelect={setSelectedZone}
                />
              </Show>
              <Suspense fallback={<p class="text-sm text-graphite/55">Loading analysis…</p>}>
              <Switch>
                <Match when={panel === "energy"}>
                  <Show when={energyAnalytics.isError}>
                    <p class="mb-4 text-sm text-red-700" role="alert">
                      Analytics could not be loaded. <button type="button" class="underline" onClick={() => energyAnalytics.refetch()}>Retry</button>
                    </p>
                  </Show>
                  <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <EnergyCard label="Heating" value={format(energyMetrics().totalHeatingKwh, "kWh")} />
                    <EnergyCard label="Cooling" value={format(energyMetrics().totalCoolingKwh, "kWh")} />
                    <EnergyCard label="Total HVAC" value={format(energyMetrics().totalHvacKwh, "kWh")} />
                    <EnergyCard label="Total HVAC / floor area" value={format(energyMetrics().hvacKwhPerM2, "kWh/m²")} />
                  </div>
                  <div class="mt-4 space-y-4">
                    <FullChart title="Heating consumption"><EChart option={heatingOption()} /></FullChart>
                    <FullChart title="Cooling consumption"><EChart option={coolingOption()} /></FullChart>
                    <FullChart title="Total HVAC consumption"><EChart option={totalHvacOption()} /></FullChart>
                  </div>
                </Match>
                <Match when={panel === "temperature"}>
                  <SingleMetricSummary
                    simulationName={props.simulation.name}
                    title="Summary metrics"
                    unit="°C"
                    values={zoneSteps().map(value => value?.zone_air_temp_c)}
                  />
                  <div class="mt-4"><FullChart title={`Air temperature · ${selectedZone() || "selected zone"}`}><EChart option={temperatureOption()} /></FullChart></div>
                </Match>
                <Match when={panel === "co2"}>
                  <SingleCo2Summary
                    simulationName={props.simulation.name}
                    timesteps={props.timesteps}
                    zone={selectedZone()}
                  />
                  <div class="mt-4"><FullChart title={`Zone CO₂ concentration · ${selectedZone() || "selected zone"}`}><EChart option={co2Option()} /></FullChart></div>
                </Match>
                <Match when={panel === "humidity"}>
                  <SingleMetricSummary
                    simulationName={props.simulation.name}
                    title="Summary metrics"
                    unit="%"
                    values={zoneSteps().map(value => value?.relative_humidity_percent)}
                  />
                  <div class="mt-4"><FullChart title={`Relative humidity · ${selectedZone() || "selected zone"}`}><EChart option={humidityOption()} /></FullChart></div>
                </Match>
                <Match when={panel === "ventilation"}>
                  <SingleVentilationSummary simulationName={props.simulation.name} timesteps={props.timesteps} />
                  <div class="mt-4"><FullChart title="Outdoor-air flow"><EChart option={ventilationOption()} /></FullChart></div>
                </Match>
                <Match when={panel === "windowOpening"}>
                  <SingleWindowSummary simulationName={props.simulation.name} values={props.timesteps.map(step => windowOpeningPercent(step, selectedZone()))} openableArea={energyAnalytics.data?.zones[selectedZone()]?.openable_window_area_m2} />
                  <div class="mt-4"><FullChart title={`Mean window opening · ${selectedZone() || "selected zone"}`}><EChart option={windowOpeningOption()} /></FullChart></div>
                </Match>
                <Match when={panel === "greenWall"}>
                  <Show when={energyAnalytics.data} fallback={<p class="text-sm text-graphite/55">Loading Green Wall analysis…</p>}>
                    {analytics => <>
                      <SeasonalEnergyAnalysis
                        compared={[{ simulation: props.simulation, analytics: analytics() }]}
                        baseline={{ id: props.simulation.id, name: props.simulation.name }}
                        singleSimulation
                      />
                      <div class="mt-6"><SinglePlantSummary simulationName={props.simulation.name} plant={props.simulation.plantSimulation} onPreview={() => setPreviewPlantId(props.simulation.plantSimulation?.plantId ?? "")} /></div>
                    </>}
                  </Show>
                </Match>
                <Match when={panel === "thermalZones"}>
                  <Show when={energyAnalytics.data} fallback={<p class="text-sm text-graphite/55">Loading building information…</p>}>
                    {analytics => <BuildingInformation simulation={props.simulation} timesteps={props.timesteps} analytics={analytics()} />}
                  </Show>
                </Match>
                <Match when={panel === "construction"}>
                  <ConstructionSetComparison simulations={[props.simulation]} scrollCardsOnly />
                </Match>
              </Switch>
              </Suspense>
            </AnalysisDialog>
          )}
        </Show>
        <Show when={previewPlantId()}>
          {id => <PlantModelDialog plantId={id()} onClose={() => setPreviewPlantId("")} />}
        </Show>
      </div>
    </Show>
  );
}

function chartOption(
  timestamps: string[],
  yName: string,
  series: any[],
  min?: number,
): EChartsOption {
  return {
    color: COLORS,
    tooltip: { trigger: "axis" },
    legend: { bottom: 5 },
    grid: { left: 60, right: 24, top: 30, bottom: 76 },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: timestamps,
      axisLabel: { hideOverlap: true, margin: 12 },
    },
    yAxis: {
      type: "value",
      name: yName,
      scale: min === undefined,
      min,
      nameGap: 24,
    },
    dataZoom: [{ type: "inside" }, { type: "slider", height: 18, bottom: 34 }],
    series,
  };
}
function line(
  name: string,
  data: Array<number | null | undefined>,
  step?: "step",
): any {
  return {
    name,
    type: "line",
    data,
    step,
    showSymbol: false,
    connectNulls: false,
    sampling: "lttb",
    progressive: 2000,
    progressiveThreshold: 3000,
    emphasis: { focus: "series" },
  };
}
function FullChart(props: { title: string; children: unknown }) {
  return (
    <section class="rounded-xl border border-warm-stone/15 bg-sky-mist/5 p-4">
      <h3 class="text-sm font-bold text-graphite">{props.title}</h3>
      <div class="mt-3">{props.children as any}</div>
    </section>
  );
}
function EnergyCard(props: { label: string; value: string }) {
  return (
    <article class="rounded-xl border border-citadel-blue/10 bg-sky-mist/15 p-3">
      <p class="text-xs font-semibold text-graphite/50">{props.label}</p>
      <p class="mt-1 text-lg font-bold text-graphite">{props.value}</p>
    </article>
  );
}
function SingleCo2Summary(props: {
  simulationName: string;
  timesteps: SimulationTimestep[];
  zone: string;
}) {
  const mean = (matches: (step: SimulationTimestep) => boolean) =>
    average(
      props.timesteps
        .filter(matches)
        .map((step) => zoneAt(step, props.zone)?.co2_concentration_ppm),
    );
  const weekdayDaytime = (step: SimulationTimestep) => isWeekdayHour(step, 8, 22);
  const weekdayNight = (step: SimulationTimestep) => isWeekdayHour(step, 22, 8);
  return (
    <section class="overflow-hidden rounded-2xl border border-warm-stone/20 bg-cloud-white">
      <div class="border-b border-citadel-blue/10 bg-sky-mist/30 px-4 py-3 sm:px-5">
        <h3 class="font-bold text-graphite">Average CO₂ concentration</h3>
      </div>
      <div class="cozy-scrollbar overflow-x-auto">
        <table class="w-full min-w-[42rem] border-separate border-spacing-0 text-left text-xs">
          <thead class="bg-sky-mist/25 text-graphite/55">
            <tr>
              <th rowSpan={2} class="border-b border-warm-stone/20 p-3 font-bold">Simulation</th>
              <th colSpan={1} class="border-b border-warm-stone/20 p-3 text-center font-bold">All hours</th>
              <th colSpan={1} class="border-b border-warm-stone/20 p-3 text-center font-bold">Weekdays · 08:00–22:00</th>
              <th colSpan={1} class="border-b border-warm-stone/20 p-3 text-center font-bold">Weekdays · 22:00–08:00</th>
            </tr>
            <tr>
              <th class="border-b border-warm-stone/20 p-3 font-semibold">Mean CO₂</th>
              <th class="border-b border-warm-stone/20 p-3 font-semibold">Mean CO₂</th>
              <th class="border-b border-warm-stone/20 p-3 font-semibold">Mean CO₂</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th class="border-b border-warm-stone/10 p-3 font-semibold text-graphite">{props.simulationName}</th>
              <td class="border-b border-warm-stone/10 p-3 font-semibold text-graphite">{format(mean(() => true), "ppm")}</td>
              <td class="border-b border-warm-stone/10 p-3 font-semibold text-graphite">{format(mean(weekdayDaytime), "ppm")}</td>
              <td class="border-b border-warm-stone/10 p-3 font-semibold text-graphite">{format(mean(weekdayNight), "ppm")}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SingleMetricSummary(props: {
  simulationName: string;
  title: string;
  unit: string;
  values: Array<number | null | undefined>;
}) {
  return (
    <section>
      <h3 class="mb-3 font-bold text-graphite">{props.title}</h3>
      <div class="cozy-scrollbar overflow-x-auto rounded-2xl border border-warm-stone/20">
        <table class="min-w-full text-sm">
          <thead class="bg-sky-mist/25 text-left text-xs uppercase tracking-wide text-graphite/50">
            <tr>
              <th class="p-3">Simulation</th>
              <th class="p-3">Mean</th>
              <th class="p-3">Maximum</th>
              <th class="p-3">Minimum</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-t border-warm-stone/10">
              <td class="p-3 font-semibold text-graphite">{props.simulationName}</td>
              <td class="whitespace-nowrap p-3">{format(average(props.values), props.unit)}</td>
              <td class="whitespace-nowrap p-3">{format(maximum(props.values), props.unit)}</td>
              <td class="whitespace-nowrap p-3">{format(minimum(props.values), props.unit)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SingleRowTable(props: {
  title?: string;
  simulationName: string;
  headers: string[];
  values: string[];
}) {
  return (
    <section class="overflow-hidden rounded-2xl border border-warm-stone/20 bg-cloud-white">
      <Show when={props.title}>{title => <div class="border-b border-citadel-blue/10 bg-sky-mist/30 px-4 py-3 sm:px-5"><h3 class="font-bold text-graphite">{title()}</h3></div>}</Show>
      <div class="cozy-scrollbar overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-sky-mist/25 text-left text-xs uppercase tracking-wide text-graphite/50">
            <tr><th class="p-3">Simulation</th><For each={props.headers}>{header => <th class="p-3">{header}</th>}</For></tr>
          </thead>
          <tbody>
            <tr class="border-t border-warm-stone/10"><td class="p-3 font-bold text-graphite">{props.simulationName}</td><For each={props.values}>{value => <td class="whitespace-nowrap p-3">{value}</td>}</For></tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SingleVentilationSummary(props: { simulationName: string; timesteps: SimulationTimestep[] }) {
  const value = average(
    props.timesteps
      .filter(step => isWeekdayHour(step, 8, 10))
      .map(step => outdoorAirPercentage(step)),
  );
  return <SingleRowTable simulationName={props.simulationName} headers={["Mean outdoor-air fraction · 08:00–10:00, weekdays"]} values={[format(value, "%")]} />;
}

function SingleWindowSummary(props: {
  simulationName: string;
  values: Array<number | null | undefined>;
  openableArea?: number | null;
}) {
  return <SingleRowTable title="Window opening" simulationName={props.simulationName} headers={["Total openable window area (m²)", "Mean window opening (%)"]} values={[format(props.openableArea, "m²"), format(average(props.values), "%")]} />;
}

function SinglePlantSummary(props: {
  simulationName: string;
  plant?: PlantSimulation | null;
  onPreview: () => void;
}) {
  return (
    <section class="overflow-hidden rounded-2xl border border-warm-stone/20 bg-cloud-white">
      <div class="border-b border-citadel-blue/10 bg-sky-mist/30 px-4 py-3 sm:px-5"><h3 class="font-bold text-graphite">Green wall parameters</h3></div>
      <div class="cozy-scrollbar overflow-x-auto"><table class="min-w-full text-sm"><thead class="bg-sky-mist/25 text-left text-xs uppercase tracking-wide text-graphite/50"><tr><th class="p-3">Simulation</th><th class="p-3">Plant</th><th class="p-3">Green wall size</th><th class="p-3">Lighting</th><th class="p-3">Exchange mode</th></tr></thead><tbody><tr class="border-t border-warm-stone/10"><td class="p-3 font-bold text-graphite">{props.simulationName}</td><td class="p-3"><div class="flex items-center gap-2"><span>{props.plant?.plantName ?? "—"}</span><Show when={props.plant?.plantId}><button type="button" aria-label="View plant model" title="View plant model and physiology" onClick={props.onPreview} class="rounded-full border border-citadel-blue/20 p-1.5 text-citadel-blue hover:bg-sky-mist/30"><Eye class="size-4" /></button></Show></div></td><td class="p-3">{props.plant?.greenWallSize ?? "—"}</td><td class="p-3">{props.plant?.lightingLevel ?? "—"}</td><td class="p-3">{props.plant?.exchangeMode === "UPTAKE_ONLY" ? "Uptake only" : "Full exchange"}</td></tr></tbody></table></div>
    </section>
  );
}

export function SingleThermalZoneOverview(props: {
  zones: string[];
  timesteps: SimulationTimestep[];
  analyticsZones: Record<string, Record<string, number | null>>;
}) {
  const geometry = props.timesteps[0]?.results?.zone_internal_variable_values ?? {};
  return (
    <section class="overflow-hidden rounded-2xl border border-warm-stone/20 bg-cloud-white">
      <div class="border-b border-citadel-blue/10 bg-sky-mist/30 px-4 py-3 sm:px-5"><h3 class="font-bold text-graphite">Zones</h3></div>
      <div class="cozy-scrollbar overflow-x-auto"><table class="min-w-[58rem] w-full text-sm"><thead class="bg-sky-mist/25 text-left text-xs uppercase tracking-wide text-graphite/50"><tr><th class="p-3">Thermal zone</th><th class="p-3">Floor area</th><th class="p-3">Net wall area</th><th class="p-3">Air volume</th><th class="p-3">Mean occupants · weekdays 08:00–22:00</th><th class="p-3">Mean CO₂ setpoint · weekdays 08:00–22:00</th></tr></thead><tbody><For each={props.zones}>{zone => <tr class="border-t border-warm-stone/10"><td class="p-3 font-semibold text-graphite">{zone}</td><td class="p-3">{format(geometry[zone]?.floor_area_m2, "m²")}</td><td class="p-3">{format(geometry[zone]?.net_wall_area_m2, "m²")}</td><td class="p-3">{format(geometry[zone]?.air_volume_m3, "m³")}</td><td class="p-3">{format(props.analyticsZones[zone]?.meanOccupantsWeekdays08To22, "people")}</td><td class="p-3">{format(props.analyticsZones[zone]?.meanCo2SetpointPpmWeekdays08To22, "ppm")}</td></tr>}</For></tbody></table></div>
    </section>
  );
}
function EmptyState() {
  return (
    <div class="rounded-2xl border border-dashed border-warm-stone/30 bg-sky-mist/10 p-8 text-center text-sm text-graphite/55">
      No timestep results are available for this simulation.
    </div>
  );
}
function format(value: number | null | undefined, unit: string) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value)}${unit ? ` ${unit}` : ""}`
    : "—";
}

function windowOpeningPercent(step: SimulationTimestep, zone: string) {
  const result = Object.entries(step.results?.window_opening_results ?? {}).find(
    ([key, value]) => key === zone || value.zone_name === zone,
  )?.[1];
  return result?.mean_opening_percent ?? null;
}

function numericValues(values: Array<number | null | undefined>) {
  return values.filter(
    (value): value is number =>
      typeof value === "number" && Number.isFinite(value),
  );
}

function average(values: Array<number | null | undefined>) {
  const numbers = numericValues(values);
  if (!numbers.length) return undefined;
  return numbers.reduce((total, value) => total + value, 0) / numbers.length;
}

function minimum(values: Array<number | null | undefined>) {
  const numbers = numericValues(values);
  return numbers.length ? Math.min(...numbers) : undefined;
}

function maximum(values: Array<number | null | undefined>) {
  const numbers = numericValues(values);
  return numbers.length ? Math.max(...numbers) : undefined;
}

function outdoorAirPercentage(step: SimulationTimestep) {
  const results = step.results;
  return results?.outdoor_air_flow_percent ??
    (typeof results?.outdoor_air_flow_fraction === "number"
      ? results.outdoor_air_flow_fraction * 100
      : null);
}

function isWeekdayHour(step: SimulationTimestep, startHour: number, endHour: number) {
  const raw = step.simulation_timestamp ?? step.recorded_at;
  if (!raw) return false;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return false;
  const weekday = date.getDay() >= 1 && date.getDay() <= 5;
  if (!weekday) return false;
  const hour = date.getHours() + date.getMinutes() / 60;
  return startHour < endHour
    ? hour >= startHour && hour < endHour
    : hour >= startHour || hour < endHour;
}

function ZoneSelector(props: {
  zones: string[];
  selected: string;
  onSelect: (zone: string) => void;
}) {
  return (
    <section class="mb-4 rounded-2xl border border-warm-stone/20 bg-sky-mist/15 p-4">
      <h3 class="mb-3 text-sm font-bold text-graphite">Thermal zone</h3>
      <div class="flex flex-wrap gap-2">
        <For each={props.zones}>
          {(zone) => (
            <button
              type="button"
              onClick={() => props.onSelect(zone)}
              class="rounded-full border px-3 py-2 text-xs font-semibold transition"
              classList={{
                "border-citadel-blue bg-citadel-blue text-cloud-white shadow-sm":
                  props.selected === zone,
                "border-warm-stone/25 bg-cloud-white text-graphite/65 hover:border-citadel-blue/45":
                  props.selected !== zone,
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

function AnalysisDialog(props: {
  title: string;
  onClose: () => void;
  children: unknown;
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
        onClick={(event) => {
          if (event.target === dialog) close();
        }}
        class="m-auto flex h-[min(56rem,92dvh)] w-[min(88rem,96vw)] max-w-none flex-col overflow-hidden rounded-3xl border border-warm-stone/20 bg-cloud-white p-0 shadow-2xl backdrop:bg-black/50"
      >
        <header class="relative shrink-0 border-b border-citadel-blue/10 bg-sky-mist/30 px-6 py-4 pr-14">
          <p class="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-citadel-blue">Simulation analysis</p>
          <h2 class="mt-1 text-lg font-bold text-graphite">{props.title}</h2>
          <button type="button" aria-label="Close analysis" onClick={close} class="absolute right-4 top-4 rounded-lg p-1 text-graphite/55 hover:bg-sky-mist/40">
            <X class="size-5" />
          </button>
        </header>
        <div class="cozy-scrollbar min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {props.children as any}
        </div>
      </dialog>
    </Portal>
  );
}
