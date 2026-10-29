import { For } from "solid-js";
import type { EChartsOption } from "echarts";
import EChart from "../../components/charts/EChart";
import type {
  AnalyticsResponse,
  SimulationListItem,
  SimulationReference,
} from "./simulationsService";

type Simulation = {
  simulation: SimulationListItem;
  analytics: AnalyticsResponse;
};
type Point = {
  timestamp: string;
  heatingKwh: number | null;
  coolingKwh: number | null;
  hvacKwh: number | null;
  hvacDeltaKwh?: number | null;
};
type Period = {
  label: string;
  months: number[];
  timestepCount: number;
  metrics: Record<string, number | null>;
  series: Point[];
};
type SeasonalResult = { periods: Record<string, Period> };
const periods = [
  {
    id: "maySeptember",
    label: "May–September",
    detail: "May, June, July, August and September",
  },
  {
    id: "octoberApril",
    label: "October–April",
    detail: "October, November, December, January, February, March and April",
  },
];
const colors = [
  "#3C6F8F",
  "#641D16",
  "#4D4936",
  "#8B7D73",
  "#2F7A65",
  "#7A4D8D",
];
const format = (value: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);
function periodFor(item: Simulation, id: string) {
  return (item.analytics.results.seasonal_energy as SeasonalResult | undefined)
    ?.periods[id];
}
const columns = [
  { label: "Heating", field: "totalHeatingKwh", unit: "kWh" },
  {
    label: "Δ Heating",
    field: "totalHeatingKwhDelta",
    unit: "kWh",
    delta: true,
  },
  {
    label: "Δ Heating (%)",
    field: "totalHeatingKwhDeltaPercent",
    unit: "%",
    delta: true,
  },
  { label: "Cooling", field: "totalCoolingKwh", unit: "kWh" },
  {
    label: "Δ Cooling",
    field: "totalCoolingKwhDelta",
    unit: "kWh",
    delta: true,
  },
  {
    label: "Δ Cooling (%)",
    field: "totalCoolingKwhDeltaPercent",
    unit: "%",
    delta: true,
  },
  { label: "Total HVAC", field: "totalHvacKwh", unit: "kWh" },
  {
    label: "Δ Total HVAC",
    field: "totalHvacKwhDelta",
    unit: "kWh",
    delta: true,
  },
  {
    label: "Δ Total HVAC %",
    field: "totalHvacKwhDeltaPercent",
    unit: "%",
    delta: true,
  },
  { label: "HVAC / total floor area", field: "hvacKwhPerM2", unit: "kWh/m²" },
  { label: "HVAC / total volume", field: "hvacKwhPerM3", unit: "kWh/m³" },
];
export default function SeasonalEnergyAnalysis(props: {
  compared: Simulation[];
  baseline: SimulationReference;
  showHeatingCoolingPercent?: boolean;
}) {
  const tableColumns = () =>
    columns.filter(
      (column) =>
        props.showHeatingCoolingPercent ||
        ![
          "totalHeatingKwhDeltaPercent",
          "totalCoolingKwhDeltaPercent",
        ].includes(column.field),
    );
  const option = (
    period: string,
    field: keyof Omit<Point, "timestamp">,
    difference = false,
  ): EChartsOption => {
    const rows = difference
      ? props.compared.filter(
          (item) => item.simulation.id !== props.baseline.id,
        )
      : props.compared;
    return {
      color: rows.map(
        (_, index) => colors[(index + (difference ? 1 : 0)) % colors.length],
      ),
      tooltip: { trigger: "axis" },
      legend: { bottom: 0, type: "scroll", selectedMode: true },
      grid: { left: 75, right: 20, top: 30, bottom: 100 },
      xAxis: { type: "time", axisLabel: { hideOverlap: true } },
      yAxis: {
        type: "value",
        name: difference
          ? "Compared − Baseline [kWh / timestep]"
          : "kWh / timestep",
      },
      dataZoom: [
        { type: "inside" },
        { type: "slider", height: 18, bottom: 35 },
      ],
      series: rows.map((item, index) => ({
        id: item.simulation.id,
        name: difference
          ? item.simulation.name + " − " + props.baseline.name
          : item.simulation.name,
        type: "line",
        showSymbol: false,
        connectNulls: false,
        data: (periodFor(item, period)?.series ?? []).map((point) => [
          point.timestamp,
          point[field] ?? null,
        ]),
        markLine:
          difference && index === 0
            ? {
                symbol: "none",
                silent: true,
                lineStyle: { color: "#8B7D73", type: "dashed" },
                data: [{ yAxis: 0 }],
              }
            : undefined,
      })),
    };
  };
  return (
    <div class="space-y-6">
      <p class="text-sm text-graphite/60">
        Whole-building HVAC electricity for the selected simulations. All
        differences use the first selected simulation as the baseline.
      </p>
      <For each={periods}>
        {(period) => (
          <section>
            <h3 class="mb-1 font-bold text-graphite">
              {period.label} · energy consumption
            </h3>
            <p class="mb-3 text-xs text-graphite/55">
              {period.detail}. All hours in the available analysis range.
            </p>
            <div class="cozy-scrollbar overflow-x-auto rounded-2xl border border-warm-stone/20">
              <table class="min-w-full text-sm">
                <thead class="bg-sky-mist/25 text-left text-xs uppercase tracking-wide text-graphite/50">
                  <tr>
                    <th class="p-3">Simulation</th>
                    <For each={tableColumns()}>
                      {(column) => <th class="p-3">{column.label}</th>}
                    </For>
                  </tr>
                </thead>
                <tbody>
                  <For each={props.compared}>
                    {(item) => (
                      <tr class="border-t border-warm-stone/10">
                        <td class="p-3 font-bold text-graphite">
                          {item.simulation.name}
                          {item.simulation.id === props.baseline.id && (
                            <span class="ml-2 text-[0.65rem] uppercase text-citadel-blue">
                              Baseline
                            </span>
                          )}
                        </td>
                        <For each={tableColumns()}>
                          {(column) => {
                            const value = () =>
                              periodFor(item, period.id)?.metrics[column.field];
                            return (
                              <td class="whitespace-nowrap p-3">
                                {typeof value() === "number" &&
                                Number.isFinite(value())
                                  ? (column.delta && value()! >= 0 ? "+" : "") +
                                    format(value()!) +
                                    " " +
                                    column.unit
                                  : "—"}
                              </td>
                            );
                          }}
                        </For>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </section>
        )}
      </For>
      <For each={periods}>
        {(period) => (
          <section class="space-y-4">
            <h3 class="font-bold text-graphite">
              {period.label} · energy graphs
            </h3>
            <For
              each={[
                { title: "Heating consumption", field: "heatingKwh" as const },
                { title: "Cooling consumption", field: "coolingKwh" as const },
                { title: "Total HVAC consumption", field: "hvacKwh" as const },
                {
                  title: "Total HVAC difference (Compared − Baseline)",
                  field: "hvacDeltaKwh" as const,
                },
              ]}
            >
              {(chart) => (
                <section class="rounded-2xl border border-warm-stone/20 bg-cloud-white p-4">
                  <h4 class="mb-3 font-bold text-graphite">
                    {period.label + " · " + chart.title}
                  </h4>
                  <EChart
                    option={option(
                      period.id,
                      chart.field,
                      chart.field === "hvacDeltaKwh",
                    )}
                    class="h-[26rem] w-full sm:h-[30rem]"
                  />
                </section>
              )}
            </For>
          </section>
        )}
      </For>
    </div>
  );
}
