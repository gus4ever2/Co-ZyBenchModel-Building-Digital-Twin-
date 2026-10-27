import { Activity, Thermometer, Wind, Zap } from "lucide-solid";
import { For, Show, createMemo } from "solid-js";
import { timestampLabel, zoneNames } from "./simulationAnalytics";
import type {
  SimulationListItem,
  SimulationTimestep,
} from "./simulationsService";

export default function CurrentSimulationDataView(props: {
  simulation: SimulationListItem;
  timestep?: SimulationTimestep;
}) {
  const zones = createMemo(() =>
    props.timestep ? zoneNames([props.timestep]) : [],
  );
  const hvacKwh = () =>
    props.timestep?.results?.meter_results?.hvac_electricity_kwh ?? null;

  return (
    <Show when={props.timestep} fallback={<EmptyState />}>
      {(timestep) => (
        <div class="space-y-5">
          <section class="rounded-2xl border border-warm-stone/20 bg-sky-mist/12 p-4 shadow-sm">
            <p class="text-xs font-bold uppercase tracking-widest text-citadel-blue">
              Current simulation time
            </p>
            <p class="mt-1 text-xl font-bold text-graphite">
              {timestampLabel(timestep(), timestep().timestep_number ?? 0)}
            </p>
          </section>

          <Show
            when={
              typeof timestep().results?.outdoor_air_flow_fraction === "number"
            }
          >
            <section class="rounded-2xl border border-citadel-blue/15 bg-sky-mist/12 p-4 shadow-sm">
              <div class="flex items-start gap-3">
                <span class="grid size-9 shrink-0 place-items-center rounded-xl bg-cloud-white text-citadel-blue">
                  <Wind class="size-5" />
                </span>
                <div class="min-w-0">
                  <p class="font-bold text-graphite">Ventilation status</p>
                  <div class="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-graphite/70">
                    <p>
                      <span class="font-semibold text-graphite">
                        Mean outdoor-air fraction:
                      </span>{" "}
                      {format(
                        (timestep().results?.outdoor_air_flow_fraction ?? 0) *
                          100,
                        "%",
                      )}
                    </p>
                    <Show
                      when={
                        typeof timestep().results?.economizer_status ===
                        "number"
                      }
                    >
                      <p>
                        <span class="font-semibold text-graphite">
                          Economizer status:
                        </span>{" "}
                        {format(timestep().results?.economizer_status, "")}
                      </p>
                    </Show>
                  </div>
                </div>
              </div>
            </section>
          </Show>

          <section>
            <SectionTitle
              title="HVAC energy · current timestep"
              description="EnergyPlus values for the current simulation timestep. Total HVAC includes all HVAC electricity, including fans."
            />
            <div class="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric
                label="Heating"
                value={format(
                  timestep().results?.meter_results?.heating_electricity_kwh,
                  "kWh",
                )}
                icon={<Thermometer />}
              />
              <Metric
                label="Cooling"
                value={format(
                  timestep().results?.meter_results?.cooling_electricity_kwh,
                  "kWh",
                )}
                icon={<Activity />}
              />
              <Metric
                label="Total HVAC"
                value={format(hvacKwh(), "kWh")}
                icon={<Zap />}
              />
              <Metric
                label="HVAC / floor area"
                value={format(timestep().results?.hvac_kwh_per_m2, "kWh/m²")}
                icon={<Zap />}
              />
            </div>
          </section>

          <section>
            <SectionTitle
              title="Thermal zones"
              description="Current zone conditions and native HVAC-node outputs. A dash means that the output was not present in this simulation."
            />
            <div class="mt-3 grid gap-4 xl:grid-cols-2">
              <For each={zones()}>
                {(zoneName) => {
                  const zone = () =>
                    timestep().results?.zone_results?.[zoneName];
                  return (
                    <article class="rounded-2xl border border-warm-stone/20 bg-cloud-white p-4 shadow-sm">
                      <h3
                        class="truncate font-bold text-graphite"
                        title={zoneName}
                      >
                        {zoneName}
                      </h3>
                      <div class="mt-3 grid gap-2 sm:grid-cols-2">
                        <Reading
                          label="Air temperature"
                          value={format(zone()?.zone_air_temp_c, "°C")}
                        />
                        <Reading
                          label="Zone CO₂ concentration"
                          value={format(zone()?.co2_concentration_ppm, "ppm")}
                        />
                        <Reading
                          label="Heating setpoint"
                          value={format(zone()?.heating_setpoint_c, "°C")}
                        />
                        <Reading
                          label="Cooling setpoint"
                          value={format(zone()?.cooling_setpoint_c, "°C")}
                        />
                        <Reading
                          label="Occupants"
                          value={format(zone()?.occupant_count, "")}
                        />
                        <Reading
                          label="Supply-air flow"
                          value={format(
                            zone()?.supply_air_mass_flow_kg_s,
                            "kg/s",
                          )}
                        />
                        <Reading
                          label="Supply-air temperature"
                          value={format(zone()?.supply_air_temp_c, "°C")}
                        />
                        <Reading
                          label="Supply CO₂"
                          value={format(
                            zone()?.supply_co2_mass_flow_g_s,
                            "g/s",
                          )}
                        />
                        <Reading
                          label="Return-air flow"
                          value={format(
                            zone()?.return_air_mass_flow_kg_s,
                            "kg/s",
                          )}
                        />
                        <Reading
                          label="Return CO₂"
                          value={format(
                            zone()?.return_co2_mass_flow_g_s,
                            "g/s",
                          )}
                        />
                      </div>
                    </article>
                  );
                }}
              </For>
            </div>
          </section>
        </div>
      )}
    </Show>
  );
}

function SectionTitle(props: { title: string; description: string }) {
  return (
    <div>
      <h2 class="font-bold text-graphite">{props.title}</h2>
      <p class="mt-1 text-xs text-graphite/50">{props.description}</p>
    </div>
  );
}

function Metric(props: { label: string; value: string; icon: unknown }) {
  return (
    <article class="rounded-2xl border border-cloud-white/50 bg-cloud-white/95 p-4 shadow-lg">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-xs font-semibold text-graphite/50">{props.label}</p>
          <p class="mt-1 text-xl font-bold text-graphite">{props.value}</p>
        </div>
        <span class="grid size-10 place-items-center rounded-xl bg-sky-mist/25 text-citadel-blue">
          {props.icon as any}
        </span>
      </div>
    </article>
  );
}

function Reading(props: { label: string; value: string }) {
  return (
    <div class="rounded-xl bg-sky-mist/12 p-3">
      <p class="text-[0.65rem] font-bold uppercase tracking-wide text-graphite/45">
        {props.label}
      </p>
      <p class="mt-1 font-bold text-graphite">{props.value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div class="rounded-2xl border border-dashed border-warm-stone/30 bg-sky-mist/10 p-8 text-center text-sm text-graphite/55">
      No timestep results have been written by the co-simulator yet.
    </div>
  );
}

function format(value: number | null | undefined, unit: string) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 3 }).format(value)}${unit ? ` ${unit}` : ""}`
    : "—";
}
