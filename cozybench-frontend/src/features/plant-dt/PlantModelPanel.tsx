import { Activity, ChevronDown, Leaf } from "lucide-solid";
import { Show, createSignal, createEffect } from "solid-js";
import PlantThreeViewer from "./PlantThreeViewer";
import type { PlantCreationEvent } from "./plantDtService";

export default function PlantModelPanel(props: { plant: PlantCreationEvent }) {
  const plant = () => props.plant;
  const [physiologyOpen, setPhysiologyOpen] = createSignal(false);
  const [leafAreaOpen, setLeafAreaOpen] = createSignal(false);
  createEffect(() => {
    void props.plant.id;
    setPhysiologyOpen(false);
    setLeafAreaOpen(false);
  });
  return <div class="flex min-h-0 flex-1 flex-col">
                <div class="relative mb-4 flex shrink-0 flex-wrap items-start justify-between gap-4">
                  <div class="min-w-0 flex-[1_1_14rem]">
                    <p class="text-xs font-bold uppercase tracking-[0.16em] text-citadel-blue">
                      3D plant model
                    </p>
                    <h1
                      class="mt-1 truncate text-xl font-bold text-graphite"
                      title={plant().name}
                    >
                      {plant().name}
                    </h1>
                  </div>
                  <div class="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      aria-expanded={physiologyOpen()}
                      onClick={() => {
                        setLeafAreaOpen(false);
                        setPhysiologyOpen((open) => !open);
                      }}
                      class="flex shrink-0 items-center gap-3 rounded-xl border border-citadel-blue/15 bg-sky-mist/25 px-3 py-2 text-left transition hover:border-citadel-blue/35 hover:bg-sky-mist/40"
                    >
                      <span class="grid size-9 place-items-center rounded-lg bg-cloud-white text-citadel-blue shadow-sm">
                        <Activity class="size-4" />
                      </span>
                      <span>
                        <span class="block text-[0.62rem] font-bold uppercase tracking-[0.14em] text-graphite/45">
                          Leaf physiology
                        </span>
                        <span class="mt-0.5 block text-xs font-semibold text-graphite">
                          5 parameters
                        </span>
                      </span>
                      <ChevronDown
                        class="size-4 text-citadel-blue transition-transform"
                        classList={{ "rotate-180": physiologyOpen() }}
                      />
                    </button>
                    <button
                      type="button"
                      aria-expanded={leafAreaOpen()}
                      onClick={() => {
                        setPhysiologyOpen(false);
                        setLeafAreaOpen((open) => !open);
                      }}
                      class="flex shrink-0 items-center gap-3 rounded-xl border border-citadel-blue/15 bg-sky-mist/25 px-3 py-2 text-left transition hover:border-citadel-blue/35 hover:bg-sky-mist/40"
                    >
                      <span class="grid size-9 place-items-center rounded-lg bg-cloud-white text-citadel-blue shadow-sm">
                        <Leaf class="size-4" />
                      </span>
                      <span>
                        <span class="block text-[0.62rem] font-bold uppercase tracking-[0.14em] text-graphite/45">
                          Leaf area
                        </span>
                        <span class="mt-0.5 block text-xs font-semibold text-graphite">
                          Total foliage
                        </span>
                      </span>
                      <ChevronDown
                        class="size-4 text-citadel-blue transition-transform"
                        classList={{ "rotate-180": leafAreaOpen() }}
                      />
                    </button>
                  </div>
                  <Show when={physiologyOpen()}>
                    <div class="absolute right-0 top-[calc(100%+0.5rem)] z-20 w-72 rounded-2xl border border-citadel-blue/15 bg-cloud-white p-3 shadow-2xl shadow-black/15">
                      <p class="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-citadel-blue">
                        Leaf physiology
                      </p>
                      <div class="grid grid-cols-3 gap-2">
                        <PhysiologyMetric label="Reflectance" value={plant().reflectance} unit="fraction" />
                        <PhysiologyMetric label="Transmittance" value={plant().transmittance} unit="fraction" />
                        <PhysiologyMetric label="Vcmax" value={plant().vcmax} unit="μmol·m⁻²·s⁻¹" />
                        <PhysiologyMetric label="Jmax" value={plant().jmax} unit="μmol·m⁻²·s⁻¹" />
                        <PhysiologyMetric label="Rd" value={plant().rd} unit="μmol·m⁻²·s⁻¹" />
                      </div>
                    </div>
                  </Show>
                  <Show when={leafAreaOpen()}>
                    <div class="absolute right-0 top-[calc(100%+0.5rem)] z-20 w-56 rounded-2xl border border-citadel-blue/15 bg-cloud-white p-3 shadow-2xl shadow-black/15">
                      <p class="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-citadel-blue">
                        Leaf area
                      </p>
                      <div class="rounded-xl bg-sky-mist/25 px-3 py-3">
                        <span class="block text-[0.62rem] font-semibold text-graphite/45">
                          Total leaf area
                        </span>
                        <strong class="mt-1 block text-lg text-graphite">
                          {formatSquareMeters(plant().totalLeafAreaM2)}
                        </strong>
                      </div>
                    </div>
                  </Show>
                </div>
                <div class="min-h-0 flex-1">
                  <PlantThreeViewer plantId={plant().id} />
                </div>

  </div>;
}

function formatSquareMeters(value: number | null | undefined) {
  return Number.isFinite(value) ? `${value!.toLocaleString()} m²` : "—";
}

function PhysiologyMetric(props: { label: string; value: number; unit: string }) {
  return (
    <div class="rounded-xl bg-sky-mist/25 px-2 py-2 text-center">
      <span class="block text-[0.62rem] font-semibold text-graphite/45">
        {props.label}
      </span>
      <strong class="mt-1 block text-sm text-graphite">
        {Number.isFinite(props.value) ? props.value.toLocaleString() : "—"}
      </strong>
      <span class="mt-0.5 block text-[0.55rem] text-graphite/45">{props.unit}</span>
    </div>
  );
}
