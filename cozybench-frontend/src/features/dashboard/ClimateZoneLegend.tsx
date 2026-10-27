import { For } from "solid-js";
import { climateZones } from "./dashboardMockData";

export default function ClimateZoneLegend() {
  return (
    <aside class="flex min-h-0 flex-col border-t border-warm-stone/15 bg-sky-mist/10 lg:border-t-0 lg:border-l">
      <div class="shrink-0 border-b border-warm-stone/15 px-5 py-4">
        <p class="text-xs font-bold uppercase tracking-[0.18em] text-citadel-blue">
          ASHRAE legend
        </p>
        <h3 class="mt-1 text-lg font-bold text-graphite">Climate zones</h3>
      </div>

      <div class="cozy-scrollbar grid max-h-48 grid-cols-2 gap-x-5 gap-y-2.5 overflow-y-auto px-5 py-4 sm:grid-cols-3 lg:max-h-none lg:flex-1 lg:grid-cols-1">
        <For each={climateZones}>
          {(zone) => (
            <div
              class="flex min-w-0 items-center gap-2.5"
              title={`${zone.code}: ${zone.label}`}
            >
              <span
                class="size-4 shrink-0 rounded-sm ring-1 ring-graphite/10"
                style={{ "background-color": zone.color }}
              />
              <p class="min-w-0 truncate text-xs text-graphite/65">
                <strong class="font-bold text-graphite">{zone.code}</strong>
                <span class="mx-1 text-graphite/30">·</span>
                {zone.label}
              </p>
            </div>
          )}
        </For>
      </div>
    </aside>
  );
}
