import type { EChartsOption } from "echarts";
import { For, Show, createEffect, createMemo, createSignal } from "solid-js";
import EChart from "../../components/charts/EChart";
import { timestampLabel, zoneAt, zoneNames } from "./simulationAnalytics";
import type {
  AnalyticsResponse,
  SimulationListItem,
  SimulationTimestep,
} from "./simulationsService";

type BuildingInformationProps = {
  simulation: SimulationListItem;
  timesteps: SimulationTimestep[];
  analytics: AnalyticsResponse;
};

export function hasBuildingInformation(
  timesteps: SimulationTimestep[],
  analytics?: AnalyticsResponse,
) {
  return Boolean(
    Object.keys(analytics?.zones ?? {}).length ||
      Object.keys(timesteps[0]?.results?.zone_internal_variable_values ?? {}).length ||
      zoneNames(timesteps).length,
  );
}

export default function BuildingInformation(props: BuildingInformationProps) {
  const zones = createMemo(() => {
    const analyticsZones = Object.keys(props.analytics.zones);
    return (analyticsZones.length ? analyticsZones : zoneNames(props.timesteps)).sort(
      (left, right) => left.localeCompare(right),
    );
  });
  const [selectedZone, setSelectedZone] = createSignal("");
  const metrics = () => props.analytics.metrics;
  const selectedGeometry = () =>
    props.timesteps[0]?.results?.zone_internal_variable_values?.[selectedZone()];
  const selectedMetrics = () => props.analytics.zones[selectedZone()] ?? {};

  createEffect(() => {
    if (!zones().includes(selectedZone())) setSelectedZone(zones()[0] ?? "");
  });

  const occupantOption = createMemo<EChartsOption>(() => ({
    animation: false,
    grid: { left: 54, right: 24, top: 28, bottom: 76 },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: props.timesteps.map(timestampLabel),
      axisLabel: { color: "#5d625f", hideOverlap: true },
    },
    yAxis: {
      type: "value",
      name: "People",
      minInterval: 1,
      axisLabel: { color: "#5d625f" },
      splitLine: { lineStyle: { color: "#d9e0e5" } },
    },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      { type: "slider", start: 0, end: 100, height: 18, bottom: 20 },
    ],
    series: [
      {
        type: "line",
        name: "Occupants",
        showSymbol: false,
        smooth: false,
        lineStyle: { color: "#3C6F8F", width: 2 },
        itemStyle: { color: "#3C6F8F" },
        data: props.timesteps.map(
          (step) => zoneAt(step, selectedZone())?.occupant_count ?? null,
        ),
      },
    ],
  }));

  return (
    <article class="overflow-hidden rounded-2xl border border-warm-stone/20 bg-cloud-white">
      <header class="border-b border-citadel-blue/10 bg-sky-mist/30 px-4 py-3 sm:px-5">
        <h3 class="font-bold text-graphite">{props.simulation.name}</h3>
      </header>

      <section class="p-4 sm:p-5">
        <h4 class="mb-3 text-sm font-bold text-graphite">Whole building</h4>
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Total floor area" value={format(metrics().totalFloorAreaM2, "m²")} />
          <Metric label="Net wall area" value={format(metrics().totalNetWallAreaM2, "m²")} />
          <Metric label="Total air volume" value={format(metrics().totalVolumeM3, "m³")} />
          <Metric label="Total openable windows" value={windowCount(metrics().totalOpenableWindowCount)} />
          <Metric label="Total openable window area" value={format(metrics().totalOpenableWindowAreaM2, "m²")} />
          <Show when={isNumber(metrics().totalLeafAreaM2)}>
            <Metric label="Total leaf area" value={format(metrics().totalLeafAreaM2, "m²")} />
          </Show>
          <Metric label="Mean occupants · weekdays 08:00–22:00" value={format(metrics().meanOccupantsWeekdays08To22, "people")} />
          <Show when={props.simulation.thermostatSetpoints}>
            {(setpoints) => <>
              <Metric label="Heating setpoint" value={format(setpoints().heatingSetpointC, "°C")} />
              <Metric label="Cooling setpoint" value={format(setpoints().coolingSetpointC, "°C")} />
            </>}
          </Show>
        </div>
      </section>

      <section class="border-t border-warm-stone/10 p-4 sm:p-5">
        <h4 class="text-sm font-bold text-graphite">Thermal zone</h4>
        <div class="mt-3 flex flex-wrap gap-2" aria-label="Select thermal zone">
          <For each={zones()}>
            {(zone) => (
              <button
                type="button"
                aria-pressed={selectedZone() === zone}
                onClick={() => setSelectedZone(zone)}
                class="rounded-full border px-3 py-2 text-xs font-semibold transition"
                classList={{
                  "border-citadel-blue bg-citadel-blue text-cloud-white shadow-sm": selectedZone() === zone,
                  "border-warm-stone/25 bg-cloud-white text-graphite/65 hover:border-citadel-blue/45 hover:bg-sky-mist/25": selectedZone() !== zone,
                }}
              >
                {zone}
              </button>
            )}
          </For>
        </div>

        <Show when={selectedZone()}>
          <div class="mt-4">
            <h5 class="text-sm font-bold text-graphite">{selectedZone()}</h5>
            <div class="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <Metric label="Floor area" value={format(selectedMetrics().floor_area_m2 ?? selectedGeometry()?.floor_area_m2, "m²")} />
              <Metric label="Net wall area" value={format(selectedMetrics().net_wall_area_m2 ?? selectedGeometry()?.net_wall_area_m2, "m²")} />
              <Metric label="Air volume" value={format(selectedMetrics().air_volume_m3 ?? selectedGeometry()?.air_volume_m3, "m³")} />
              <Metric label="Openable windows" value={windowCount(selectedMetrics().openable_window_count)} />
              <Metric label="Openable window area" value={format(selectedMetrics().openable_window_area_m2, "m²")} />
            </div>
            <section class="mt-4 rounded-xl border border-warm-stone/20 bg-sky-mist/10 p-3 sm:p-4">
              <h5 class="mb-2 text-sm font-bold text-graphite">Occupants · {selectedZone()}</h5>
              <EChart option={occupantOption()} class="h-72 w-full" />
            </section>
          </div>
        </Show>
      </section>
    </article>
  );
}

function Metric(props: { label: string; value: string }) {
  return (
    <div class="rounded-xl border border-warm-stone/20 bg-sky-mist/10 px-3 py-3">
      <p class="text-[0.65rem] font-semibold uppercase tracking-wide text-graphite/50">{props.label}</p>
      <p class="mt-1 font-bold text-graphite">{props.value}</p>
    </div>
  );
}

function isNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function format(value: number | null | undefined, unit: string) {
  return isNumber(value)
    ? `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value)} ${unit}`
    : "—";
}

function windowCount(value: number | null | undefined) {
  return isNumber(value) ? `${Math.round(value)} windows` : "—";
}
