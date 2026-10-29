import type { EChartsOption } from "echarts";
import { createQuery } from "@tanstack/solid-query";
import { loadSimulationAnalytics } from "./simulationsService";
import {
  AirVent,
  Atom,
  Droplets,
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
  onMount,
} from "solid-js";
import { Portal } from "solid-js/web";
import WorkspaceNavigationCard from "../../components/building-dt/WorkspaceNavigationCard";
import EChart from "../../components/charts/EChart";
import SimulationSetupCard from "./SimulationSetupCard";
import {
  timestampLabel,
  zoneAt,
  zoneNames,
} from "./simulationAnalytics";
import type {
  SimulationListItem,
  SimulationTimestep,
} from "./simulationsService";

const COLORS = ["#3C6F8F", "#641D16", "#4D4936"];

type AnalysisPanel =
  | "energy"
  | "co2"
  | "temperature"
  | "humidity"
  | "ventilation"
  | "greenWall"
  | "windowOpening"
  | "thermalZones";

export default function SimulationDataView(props: {
  simulation: SimulationListItem;
  timesteps: SimulationTimestep[];
}) {
  const [selectedZone, setSelectedZone] = createSignal("");
  const [activePanel, setActivePanel] = createSignal<AnalysisPanel | null>(null);
  const zones = createMemo(() => zoneNames(props.timesteps));
  const timestamps = () => props.timesteps.map(timestampLabel);
  const zoneSteps = () =>
    props.timesteps.map((step) => zoneAt(step, selectedZone()));
  const energyAnalytics = createQuery(() => ({
    queryKey: ["simulation-analytics", props.simulation.id, props.timesteps.length],
    queryFn: () =>
      loadSimulationAnalytics(props.simulation.id, 0, props.timesteps.length),
    enabled: activePanel() === "energy" && props.timesteps.length > 0,
  }));
  const energyMetrics = () => energyAnalytics.data?.metrics ?? {};

  createEffect(() => {
    if (!zones().includes(selectedZone())) setSelectedZone(zones()[0] ?? "");
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
      thermalZones: "Thermal zones",
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
            <WorkspaceNavigationCard icon={MapPin} title="Thermal zones" description="Review the thermal zones included in this simulation." onClick={() => setActivePanel("thermalZones")} />
          </div>
        </div>

        <Show when={activePanel()} keyed>
          {(panel) => (
            <AnalysisDialog title={panelTitle(panel)} onClose={() => setActivePanel(null)}>
              <Show when={["co2", "temperature", "humidity", "windowOpening"].includes(panel)}>
                <ZoneSelector zones={zones()} selected={selectedZone()} onSelect={setSelectedZone} />
              </Show>
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
                <Match when={panel === "temperature"}><FullChart title={`Air temperature · ${selectedZone() || "selected zone"}`}><EChart option={temperatureOption()} /></FullChart></Match>
                <Match when={panel === "co2"}><FullChart title={`Zone CO₂ concentration · ${selectedZone() || "selected zone"}`}><EChart option={co2Option()} /></FullChart></Match>
                <Match when={panel === "humidity"}><FullChart title={`Relative humidity · ${selectedZone() || "selected zone"}`}><EChart option={humidityOption()} /></FullChart></Match>
                <Match when={panel === "ventilation"}><FullChart title="Outdoor-air flow"><EChart option={ventilationOption()} /></FullChart></Match>
                <Match when={panel === "windowOpening"}><FullChart title={`Mean window opening · ${selectedZone() || "selected zone"}`}><EChart option={windowOpeningOption()} /></FullChart></Match>
                <Match when={panel === "greenWall"}><AnalysisSummary rows={[["Status", props.simulation.plantSimulation ? "Enabled" : "Not enabled for this simulation"], ["Plant", props.simulation.plantSimulation?.plantName ?? "—"], ["Green wall size", props.simulation.plantSimulation?.greenWallSize ?? "—"], ["Lighting", props.simulation.plantSimulation?.lightingLevel ?? "—"]]} /></Match>
                <Match when={panel === "thermalZones"}><AnalysisSummary rows={zones().map((zone, index) => [`Zone ${index + 1}`, zone])} empty="No thermal-zone results are available." /></Match>
              </Switch>
            </AnalysisDialog>
          )}
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

function AnalysisSummary(props: {
  rows: Array<[string, string]>;
  empty?: string;
}) {
  return (
    <section class="rounded-2xl border border-warm-stone/20 bg-cloud-white p-4 shadow-sm">
      <Show
        when={props.rows.length > 0}
        fallback={<p class="text-sm text-graphite/55">{props.empty ?? "No data is available."}</p>}
      >
        <For each={props.rows}>
          {([label, value]) => (
            <div class="grid grid-cols-[minmax(8rem,1fr)_minmax(0,2fr)] gap-3 border-b border-warm-stone/10 py-3 text-sm last:border-0">
              <span class="text-graphite/50">{label}</span>
              <span class="break-words text-right font-semibold text-graphite">{value}</span>
            </div>
          )}
        </For>
      </Show>
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
