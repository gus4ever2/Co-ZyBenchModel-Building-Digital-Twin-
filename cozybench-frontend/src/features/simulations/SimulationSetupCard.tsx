import { Show } from "solid-js";
import type { SimulationListItem } from "./simulationsService";

export default function SimulationSetupCard(props: {
  simulation: SimulationListItem;
  onOpenConstructionSnapshot?: () => void;
}) {
  return (
    <section class="rounded-2xl border border-warm-stone/20 bg-sky-mist/12 p-4">
      <p class="text-xs font-bold uppercase tracking-widest text-citadel-blue">
        Simulation setup
      </p>
      <p class="mt-1 break-words text-lg font-bold text-graphite">
        {props.simulation.name}
      </p>
      <div class="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-graphite/65">
        <Tag label={props.simulation.city || "City unavailable"} />
        <Tag
          label={
            props.simulation.constructionSetName || "Construction unavailable"
          }
        />
        <Show when={props.simulation.thermostatSetpoints}>
          {settings => (
            <>
              <Tag label={"Heating · " + settings().heatingSetpointC + " °C"} />
              <Tag label={"Cooling · " + settings().coolingSetpointC + " °C"} />
            </>
          )}
        </Show>
        <Tag label={plantSetupLabel(props.simulation)} />
        <Tag label={windowSetupLabel(props.simulation)} />
        <Tag
          label={
            props.simulation.co2Control
              ? `DCV · ${props.simulation.co2Control.setpointPpm} ppm`
              : "DCV disabled"
          }
        />
      </div>
      <Show when={props.onOpenConstructionSnapshot}>
        {(openSnapshot) => (
          <button
            type="button"
            onClick={() => openSnapshot()}
            class="mt-3 rounded-lg border border-citadel-blue/20 bg-cloud-white px-3 py-2 text-xs font-bold text-citadel-blue transition hover:border-citadel-blue/45 hover:bg-sky-mist/25"
          >
            View construction snapshot
          </button>
        )}
      </Show>
    </section>
  );
}

function Tag(props: { label: string }) {
  return (
    <span class="rounded-full bg-cloud-white px-2.5 py-1">{props.label}</span>
  );
}

function plantSetupLabel(simulation: SimulationListItem) {
  const plant = simulation.plantSimulation;
  return plant
    ? `Plant · ${plant.plantName} · ${plant.lightingLevel.toLowerCase().replace("_", " ")} light`
    : "Plant disabled";
}

function windowSetupLabel(simulation: SimulationListItem) {
  const windows = simulation.openWindows;
  if (!windows) return "Open windows disabled";
  const strategy = windows.openingStrategy === "FIXED_PERCENTAGE"
    ? "Fixed " + (windows.openingPercentage ?? "—") + "%"
    : windows.openingStrategy === "ON_OFF" ? "On–Off" : "Linear";
  return `Open windows · ${strategy} · ${windows.co2ThresholdPpm} ppm`;
}
