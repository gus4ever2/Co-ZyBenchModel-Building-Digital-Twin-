import { Eye } from "lucide-solid";
import { For, Show } from "solid-js";
import type {
  AnalyticsResponse,
  ComparisonPlantConfiguration,
  SimulationListItem,
  SimulationReference,
} from "./simulationsService";

export default function GreenWallParameters(props: {
  compared: { simulation: SimulationListItem; analytics: AnalyticsResponse }[];
  configurations: ComparisonPlantConfiguration[];
  baseline: SimulationReference;
  zone: string;
  onPreview: (plantId: string) => void;
}) {
  const display = (value: number | null | undefined, unit: string) =>
    typeof value === "number" && Number.isFinite(value)
      ? new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
          value,
        ) +
        " " +
        unit
      : "—";
  return (
    <section class="space-y-3">
      <div>
        <h3 class="font-bold text-graphite">
          Green wall parameters · {props.zone}
        </h3>
        <p class="mt-1 text-xs text-graphite/55">
          Leaf area is scaled to the wall installed in this zone. Mean leaf PPFD
          uses the stored PARleaf value, including self-shading.
        </p>
      </div>
      <div class="cozy-scrollbar overflow-x-auto rounded-2xl border border-warm-stone/20">
        <table class="min-w-full text-sm">
          <thead class="bg-sky-mist/25 text-left text-xs uppercase tracking-wide text-graphite/50">
            <tr>
              <th class="p-3">Simulation</th>
              <th class="p-3">Plant</th>
              <th class="p-3">PPFD</th>
              <th class="p-3">Total leaf area</th>
              <th class="p-3">Mean leaf PPFD</th>
            </tr>
          </thead>
          <tbody>
            <For each={props.compared}>
              {(item) => {
                const configuration = () =>
                  props.configurations.find(
                    (value) => value.simulationId === item.simulation.id,
                  );
                const enabled = () =>
                  Boolean(
                    item.simulation.plantSimulation || configuration()?.enabled,
                  );
                const plantId = () =>
                  configuration()?.plantId ||
                  item.simulation.plantSimulation?.plantId;
                return (
                  <tr class="border-t border-warm-stone/10">
                    <td class="p-3 font-bold text-graphite">
                      {item.simulation.name}
                      {item.simulation.id === props.baseline.id && (
                        <span class="ml-2 text-[0.65rem] uppercase text-citadel-blue">
                          Baseline
                        </span>
                      )}
                    </td>
                    <td class="p-3">
                      <Show when={enabled()} fallback="—">
                        <div class="flex items-center gap-2">
                          <span>
                            {configuration()?.plantName ||
                              item.simulation.plantSimulation?.plantName ||
                              "—"}
                          </span>
                          <Show when={plantId()}>
                            {(id) => (
                              <button
                                type="button"
                                aria-label={
                                  "Inspect plant for " + item.simulation.name
                                }
                                title="View plant model and physiology"
                                class="rounded-full border border-citadel-blue/20 p-1.5 text-citadel-blue hover:bg-sky-mist/30"
                                onClick={() => props.onPreview(id())}
                              >
                                <Eye class="size-4" />
                              </button>
                            )}
                          </Show>
                        </div>
                      </Show>
                    </td>
                    <td class="whitespace-nowrap p-3">
                      {display(
                        enabled() ? configuration()?.ppfdUmolM2S : null,
                        "μmol·m⁻²·s⁻¹",
                      )}
                    </td>
                    <td class="whitespace-nowrap p-3">
                      {display(
                        enabled()
                          ? item.analytics.zones[props.zone]?.totalLeafAreaM2
                          : null,
                        "m²",
                      )}
                    </td>
                    <td class="whitespace-nowrap p-3">
                      {display(
                        enabled() ? configuration()?.meanParLeafUmolM2S : null,
                        "μmol·m⁻²·s⁻¹",
                      )}
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
