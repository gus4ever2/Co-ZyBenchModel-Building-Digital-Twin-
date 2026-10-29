import { For } from "solid-js";
import type { EChartsOption } from "echarts";
import EChart from "../../components/charts/EChart";
import type {
  AnalyticsResponse,
  SimulationListItem,
  SimulationReference,
  SimulationTimestep,
} from "./simulationsService";

type ComparedSimulation = {
  simulation: SimulationListItem;
  analytics: AnalyticsResponse;
  timesteps: SimulationTimestep[];
};
type RecordedSetpoints = {
  setpointsByZone?: Record<string, { heatingC: number[]; coolingC: number[] }>;
};
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

export default function GreenWallTemperatureChart(props: {
  compared: ComparedSimulation[];
  baseline: SimulationReference;
  zone: string;
}) {
  const setpoint = (item: ComparedSimulation, mode: "heating" | "cooling") => {
    const saved =
      item.simulation.thermostatSetpoints?.[
        mode === "heating" ? "heatingSetpointC" : "coolingSetpointC"
      ];
    if (typeof saved === "number" && Number.isFinite(saved))
      return format(saved) + " °C";
    const recorded =
      (item.analytics.results.temperature as RecordedSetpoints | undefined)
        ?.setpointsByZone?.[props.zone]?.[
        mode === "heating" ? "heatingC" : "coolingC"
      ] ?? [];
    return recorded.length ? recorded.map(format).join(" / ") + " °C" : "—";
  };
  const option = (): EChartsOption => ({
    color: colors,
    tooltip: {
      trigger: "axis",
      valueFormatter: (value) =>
        typeof value === "number" ? format(value) + " °C" : "—",
    },
    legend: { bottom: 0, type: "scroll", selectedMode: true },
    grid: { left: 70, right: 20, top: 30, bottom: 100 },
    xAxis: { type: "time", axisLabel: { hideOverlap: true } },
    yAxis: { type: "value", name: "Zone air temperature [°C]", scale: true },
    dataZoom: [{ type: "inside" }, { type: "slider", height: 18, bottom: 35 }],
    series: props.compared.map((item) => ({
      id: item.simulation.id,
      name: item.simulation.name,
      type: "line",
      showSymbol: false,
      connectNulls: false,
      data: item.timesteps.flatMap((step) => {
        if (!step.simulation_timestamp) return [];
        const value = step.results?.zone_results?.[props.zone]?.zone_air_temp_c;
        return [
          [
            step.simulation_timestamp,
            typeof value === "number" && Number.isFinite(value) ? value : null,
          ],
        ];
      }),
    })),
  });
  return (
    <section class="rounded-2xl border border-warm-stone/20 bg-cloud-white p-4">
      <h3 class="font-bold text-graphite">
        {props.zone} · zone air temperature
      </h3>
      <p class="mt-1 text-xs text-graphite/55">
        Temperature for every selected simulation across the available analysis
        range.
      </p>
      <EChart option={option()} class="mt-3 h-[26rem] w-full sm:h-[30rem]" />
      <h4 class="mb-3 mt-5 font-bold text-graphite">
        Heating and cooling setpoints
      </h4>
      <div class="cozy-scrollbar overflow-x-auto rounded-2xl border border-warm-stone/20">
        <table class="min-w-full text-sm">
          <thead class="bg-sky-mist/25 text-left text-xs uppercase tracking-wide text-graphite/50">
            <tr>
              <th class="p-3">Simulation</th>
              <th class="p-3">Heating setpoint</th>
              <th class="p-3">Cooling setpoint</th>
              <th class="p-3">Values shown</th>
            </tr>
          </thead>
          <tbody>
            <For each={props.compared}>
              {(item, index) => (
                <tr class="border-t border-warm-stone/10">
                  <td class="p-3 font-bold text-graphite">
                    <span
                      class="mr-2 inline-block size-2.5 rounded-full"
                      style={{
                        "background-color": colors[index() % colors.length],
                      }}
                    />
                    {item.simulation.name}
                    {item.simulation.id === props.baseline.id && (
                      <span class="ml-2 text-[0.65rem] uppercase text-citadel-blue">
                        Baseline
                      </span>
                    )}
                  </td>
                  <td class="whitespace-nowrap p-3">
                    {setpoint(item, "heating")}
                  </td>
                  <td class="whitespace-nowrap p-3">
                    {setpoint(item, "cooling")}
                  </td>
                  <td class="p-3 text-xs text-graphite/60">
                    {item.simulation.thermostatSetpoints
                      ? "Saved occupied setpoints"
                      : "Recorded zone schedule"}
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
      <p class="mt-3 text-xs text-graphite/55">
        Saved values are the occupied heating and cooling settings. For older
        simulations without saved settings, all distinct recorded values are
        shown, including setbacks. A dash means no value was recorded.
      </p>
    </section>
  );
}
