import type { EChartsOption } from "echarts";
import { createQuery } from "@tanstack/solid-query";
import { loadSimulationAnalytics } from "./simulationsService";
import { ChevronDown, Gauge, Thermometer, Users, Zap } from "lucide-solid";
import { For, Show, createEffect, createMemo, createSignal } from "solid-js";
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

export default function SimulationDataView(props: {
  simulation: SimulationListItem;
  timesteps: SimulationTimestep[];
}) {
  const [selectedZone, setSelectedZone] = createSignal("");
  const [energyRange, setEnergyRange] = createSignal({ start: 0, end: 100 });
  const zones = createMemo(() => zoneNames(props.timesteps));
  const timestamps = () => props.timesteps.map(timestampLabel);
  const zoneSteps = () =>
    props.timesteps.map((step) => zoneAt(step, selectedZone()));
  const energyAnalytics = createQuery(() => {
    const first = Math.floor((energyRange().start / 100) * Math.max(0, props.timesteps.length - 1));
    const last = Math.ceil((energyRange().end / 100) * Math.max(0, props.timesteps.length - 1)) + 1;
    return { queryKey: ["simulation-analytics", props.simulation.id, first, last, props.timesteps.length],
      queryFn: () => loadSimulationAnalytics(props.simulation.id, first, last),
      enabled: props.timesteps.length > 0 };
  });
  const energyMetrics = () => energyAnalytics.data?.metrics ?? {};

  createEffect(() => {
    if (!zones().includes(selectedZone())) setSelectedZone(zones()[0] ?? "");
  });

  const energyOption = createMemo<EChartsOption>(() =>
    chartOption(timestamps(), "kWh / timestep", [
      line(
        "Heating",
        props.timesteps.map((step) =>
          step.results?.meter_results?.heating_electricity_kwh ?? null,
        ),
      ),
      line(
        "Cooling",
        props.timesteps.map((step) =>
          step.results?.meter_results?.cooling_electricity_kwh ?? null,
        ),
      ),
      line(
        "Total HVAC",
        props.timesteps.map((step) =>
          step.results?.meter_results?.hvac_electricity_kwh ?? null,
        ),
      ),
    ]),
  );
  const temperatureOption = createMemo<EChartsOption>(() =>
    chartOption(timestamps(), "°C", [
      line(
        "Air temperature",
        zoneSteps().map((value) => value?.zone_air_temp_c),
      ),
    ]),
  );
  const co2Option = createMemo<EChartsOption>(() =>
    chartOption(timestamps(), "ppm", [
      line(
        "Zone CO₂ concentration",
        zoneSteps().map((value) => value?.co2_concentration_ppm),
      ),
    ]),
  );
  const occupantsOption = createMemo<EChartsOption>(() =>
    chartOption(
      timestamps(),
      "people",
      [
        line(
          "Occupants",
          zoneSteps().map((value) => value?.occupant_count),
          "step",
        ),
      ],
      0,
    ),
  );

  return (
    <Show when={props.timesteps.length > 0} fallback={<EmptyState />}>
      <div class="relative flex h-full min-h-0 flex-col">
        <div class="relative z-20 shrink-0 px-4 pt-4 pb-4 sm:px-5 sm:pt-5 sm:pb-4">
          <SimulationSetupCard simulation={props.simulation} />
        </div>

        <div class="cozy-scrollbar relative z-0 min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-5 sm:pb-5">
          <div class="space-y-4">
            <ChartPanel
              title="HVAC energy"
              description="Cards follow the range selected directly in this chart."
              icon={<Zap />}
              open
            >
              <Show when={energyAnalytics.isError}>
                <p class="mb-3 text-sm text-red-700" role="alert">
                  Analytics could not be loaded from the simulation service.
                  <button type="button" class="ml-2 underline" onClick={() => energyAnalytics.refetch()}>Retry</button>
                </p>
              </Show>
              <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <EnergyCard
                  label="Heating"
                  value={format(energyMetrics().totalHeatingKwh, "kWh")}
                />
                <EnergyCard
                  label="Cooling"
                  value={format(energyMetrics().totalCoolingKwh, "kWh")}
                />
                <EnergyCard
                  label="Total HVAC"
                  value={format(energyMetrics().totalHvacKwh, "kWh")}
                />
                <EnergyCard
                  label="Total HVAC / floor area"
                  value={format(energyMetrics().hvacKwhPerM2, "kWh/m²")}
                />
              </div>
              <div class="mt-4">
                <FullChart title="Energy consumption">
                  <EChart option={energyOption()} onDataZoom={setEnergyRange} />
                </FullChart>
              </div>
            </ChartPanel>

            <section class="rounded-2xl border border-warm-stone/20 bg-cloud-white p-4 shadow-sm">
              <p class="text-xs font-bold uppercase tracking-widest text-citadel-blue">
                Thermal zones
              </p>
              <p class="mt-1 text-sm text-graphite/55">
                Choose a zone to inspect its basic charts.
              </p>
              <div class="mt-4 flex flex-wrap gap-2">
                <For each={zones()}>
                  {(name) => (
                    <button
                      type="button"
                      onClick={() => setSelectedZone(name)}
                      class="rounded-full border px-4 py-2 text-sm transition"
                      classList={{
                        "border-citadel-blue bg-citadel-blue font-semibold text-cloud-white shadow-sm":
                          selectedZone() === name,
                        "border-warm-stone/25 bg-cloud-white text-graphite/70 hover:border-citadel-blue/35":
                          selectedZone() !== name,
                      }}
                    >
                      {name}
                    </button>
                  )}
                </For>
              </div>
            </section>

            <ChartPanel
              title="Temperature"
              description={`Air temperature for ${selectedZone() || "the selected zone"}.`}
              icon={<Thermometer />}
            >
              <FullChart title="Air temperature">
                <EChart option={temperatureOption()} />
              </FullChart>
            </ChartPanel>
            <ChartPanel
              title="CO₂"
              description={`CO₂ concentration for ${selectedZone() || "the selected zone"}.`}
              icon={<Gauge />}
            >
              <FullChart title="Zone CO₂ concentration">
                <EChart option={co2Option()} />
              </FullChart>
            </ChartPanel>
            <ChartPanel
              title="Occupants"
              description={`Occupant count for ${selectedZone() || "the selected zone"}.`}
              icon={<Users />}
            >
              <FullChart title="Occupants">
                <EChart option={occupantsOption()} />
              </FullChart>
            </ChartPanel>
          </div>
        </div>
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
function ChartPanel(props: {
  title: string;
  description: string;
  icon: unknown;
  open?: boolean;
  children: unknown;
}) {
  const [open, setOpen] = createSignal(Boolean(props.open));
  return (
    <details
      open={open()}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      class="group rounded-2xl border border-warm-stone/20 bg-cloud-white shadow-sm"
    >
      <summary class="flex cursor-pointer list-none items-center gap-3 p-4">
        <span class="grid size-9 place-items-center rounded-xl bg-sky-mist/30 text-citadel-blue">
          {props.icon as any}
        </span>
        <span class="min-w-0 flex-1">
          <span class="block font-bold text-graphite">{props.title}</span>
          <span class="mt-0.5 block text-xs font-normal text-graphite/50">
            {props.description}
          </span>
        </span>
        <ChevronDown class="size-5 text-citadel-blue transition group-open:rotate-180" />
      </summary>
      <Show when={open()}>
        <div class="border-t border-warm-stone/15 p-4">
          {props.children as any}
        </div>
      </Show>
    </details>
  );
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
