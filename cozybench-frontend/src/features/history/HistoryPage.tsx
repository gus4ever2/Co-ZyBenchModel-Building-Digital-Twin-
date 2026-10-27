import {
  createMutation,
  createQuery,
  useQueryClient,
} from "@tanstack/solid-query";
import {
  CalendarDays,
  Clock3,
  Download,
  Eye,
  Gauge,
  Leaf,
  LoaderCircle,
  MapPin,
  PanelsTopLeft,
  Trash2,
  Wind,
} from "lucide-solid";
import { For, Show, Suspense, createMemo, createSignal, lazy } from "solid-js";
import WorkspaceHeader from "../../components/layout/WorkspaceHeader";
import SimulationDataView from "../simulations/SimulationDataView";
import { ConstructionSnapshotDialog } from "../simulations/SimulationsPage";
import {
  deleteSimulation,
  downloadSimulationJson,
  loadSimulationHistory,
  loadSimulationResults,
  type SimulationListItem,
} from "../simulations/simulationsService";

const filters = [
  "ALL",
  "COMPLETED",
  "ERROR",
  "CANCELED",
  "CUSTOM_READY",
] as const;
const PlantModelDialog = lazy(() => import("../plant-dt/PlantModelDialog"));

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = createSignal<(typeof filters)[number]>("ALL");
  const [selectedId, setSelectedId] = createSignal("");
  const [snapshotId, setSnapshotId] = createSignal("");
  const [previewPlantId, setPreviewPlantId] = createSignal("");
  const history = createQuery(() => ({
    queryKey: ["simulations", "history"],
    queryFn: loadSimulationHistory,
  }));
  const selected = createMemo(() =>
    history.data?.find((simulation) => simulation.id === selectedId()),
  );
  const snapshotSimulation = createMemo(() =>
    history.data?.find((simulation) => simulation.id === snapshotId()),
  );
  const filtered = createMemo(() =>
    (history.data ?? []).filter(
      (simulation) => filter() === "ALL" || simulation.status === filter(),
    ),
  );
  const results = createQuery(() => ({
    queryKey: ["simulations", selectedId(), "results"],
    queryFn: () => loadSimulationResults(selectedId()),
    enabled: Boolean(selectedId()),
  }));
  const removeSimulation = createMutation(() => ({
    mutationFn: deleteSimulation,
    onSuccess: async (_, simulationId) => {
      if (selectedId() === simulationId) setSelectedId("");
      if (snapshotId() === simulationId) setSnapshotId("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["simulations", "history"] }),
        queryClient.invalidateQueries({ queryKey: ["simulations", "all"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
  }));
  const exportSimulation = createMutation(() => ({
    mutationFn: downloadSimulationJson,
  }));

  const confirmDelete = (simulationId: string, simulationName: string) => {
    if (
      window.confirm(
        `Delete “${simulationName}” and all of its timestep results?`,
      )
    ) {
      removeSimulation.mutate(simulationId);
    }
  };

  return (
    <section class="mx-auto flex h-[calc(100vh-10rem)] min-h-0 w-full max-w-7xl flex-col gap-4 lg:h-[calc(100vh-4rem)]">
      <Show when={previewPlantId()}>
        {id => <PlantModelDialog plantId={id()} onClose={() => setPreviewPlantId("")} />}
      </Show>
      <WorkspaceHeader
        eyebrow="Simulation workspace"
        title="History"
      />
      <main class="grid min-h-0 flex-1 gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <aside class="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-cloud-white/55 bg-cloud-white/95 p-4 shadow-xl">
          <div class="cozy-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1">
            <For each={filters}>
              {(item) => (
                <button
                  type="button"
                  onClick={() => setFilter(item)}
                  class="shrink-0 rounded-lg border px-2.5 py-1.5 text-[0.65rem] font-bold"
                  classList={{
                    "border-citadel-blue bg-citadel-blue text-cloud-white":
                      filter() === item,
                    "border-warm-stone/20 text-graphite/55": filter() !== item,
                  }}
                >
                  {item.replace("_", " ")}
                </button>
              )}
            </For>
          </div>
          <div class="cozy-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            <Suspense fallback={<Loading label="Loading history" />}>
            <Show
              when={!history.isPending}
              fallback={<Loading label="Loading history" />}
            >
              <Show
                when={!history.isError}
                fallback={
                  <p class="rounded-xl bg-red-wine/5 p-3 text-sm text-red-wine">
                    History could not be loaded.
                  </p>
                }
              >
                <Show
                  when={filtered().length}
                  fallback={
                    <p class="rounded-xl bg-sky-mist/12 p-3 text-sm text-graphite/50">
                      No simulations match this filter.
                    </p>
                  }
                >
                  <For each={filtered()}>
                    {(simulation) => (
                      <div class="relative">
                        <div
                          role="button"
                          tabindex="0"
                          onClick={() => setSelectedId(simulation.id)}
                          onKeyDown={(event) => {
                            if (event.currentTarget !== event.target) return;
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setSelectedId(simulation.id);
                            }
                          }}
                          class="w-full overflow-hidden rounded-2xl border text-left"
                          classList={{
                            "border-citadel-blue bg-sky-mist/25 ring-2 ring-citadel-blue/10":
                              selectedId() === simulation.id,
                            "border-warm-stone/20 bg-cloud-white hover:border-citadel-blue/40":
                              selectedId() !== simulation.id,
                          }}
                        >
                          <div class="border-b border-citadel-blue/10 bg-sky-mist/35 px-4 py-4 pr-12">
                            <p
                              class="truncate font-bold text-graphite"
                              title={simulation.name}
                            >
                              {simulation.name}
                            </p>
                            <div class="mt-1.5 flex min-w-0 items-center gap-2 text-[0.7rem] text-graphite/55">
                              <CalendarDays class="size-3.5 shrink-0 text-citadel-blue" />
                              <span
                                class="truncate"
                                title={formatDate(
                                  simulation.requestedAt ??
                                    simulation.startedAt ??
                                    simulation.completedAt,
                                )}
                              >
                                {formatDate(
                                  simulation.requestedAt ??
                                    simulation.startedAt ??
                                    simulation.completedAt,
                                )}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span class="shrink-0 font-semibold">
                                {statusLabel(simulation.status)}
                              </span>
                            </div>
                          </div>
                          <div class="space-y-2 px-4 py-4 text-xs text-graphite/60">
                            <HistoryCardRow
                              icon={<MapPin />}
                              label={cityLabel(simulation.city)}
                            />
                            <button
                              type="button"
                              disabled={exportSimulation.isPending}
                              onClick={(event) => {
                                event.stopPropagation();
                                exportSimulation.mutate(simulation.id);
                              }}
                              class="flex w-full items-center gap-2 rounded-xl border border-citadel-blue/20 p-3 font-semibold text-citadel-blue transition hover:bg-sky-mist/25 disabled:opacity-50"
                            >
                              <Show when={exportSimulation.isPending && exportSimulation.variables === simulation.id}
                                fallback={<Download class="size-4" />}>
                                <LoaderCircle class="size-4 animate-spin" />
                              </Show>
                              {exportSimulation.isPending && exportSimulation.variables === simulation.id ? "Preparing JSON…" : "Download JSON"}
                            </button>
                            <Show when={exportSimulation.isError && exportSimulation.variables === simulation.id}>
                              <p role="alert" class="text-xs text-red-wine">JSON download failed. Please try again.</p>
                            </Show>
                            <button
                              type="button"
                              aria-label={`Inspect construction snapshot for ${simulation.name}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedId(simulation.id);
                                setSnapshotId(simulation.id);
                              }}
                              title={`Construction snapshot: ${simulation.constructionSetName || "Not specified"}`}
                              class="group w-full rounded-xl border border-warm-stone/15 bg-warm-stone/5 p-3 text-left transition hover:border-citadel-blue/35 hover:bg-sky-mist/25"
                            >
                              <div class="flex min-w-0 items-start gap-2.5">
                                <PanelsTopLeft class="mt-0.5 size-4 shrink-0 text-citadel-blue" />
                                <div class="min-w-0 flex-1">
                                  <p class="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-graphite/45">
                                    Construction snapshot
                                  </p>
                                  <p class="mt-1 truncate font-semibold text-graphite/75">
                                    {simulation.constructionSetName ||
                                      "Not specified"}
                                  </p>
                                  <p class="mt-0.5 text-[0.65rem] leading-relaxed text-graphite/45">
                                    Configuration stored with this simulation
                                  </p>
                                </div>
                                <span class="ml-auto grid size-8 shrink-0 place-items-center self-center rounded-full bg-sky-mist/55 text-citadel-blue transition group-hover:bg-citadel-blue group-hover:text-cloud-white">
                                  <Eye class="size-4" />
                                </span>
                              </div>
                            </button>
                            <Show when={simulation.plantSimulation?.plantId}
                              fallback={<HistoryCardRow icon={<Leaf />} label={plantLabel(simulation)} muted={!simulation.plantSimulation} />}>
                              {plantId => (
                                <button type="button"
                                  aria-label={`View plant model for ${simulation.name}`}
                                  onClick={event => { event.stopPropagation(); setPreviewPlantId(plantId()); }}
                                  title={`Plant model: ${plantLabel(simulation)}`}
                                  class="group flex w-full items-start gap-2.5 rounded-xl border border-warm-stone/15 bg-warm-stone/5 p-3 text-left transition hover:border-citadel-blue/35 hover:bg-sky-mist/25">
                                  <Leaf class="mt-0.5 size-4 shrink-0 text-citadel-blue" />
                                  <span class="min-w-0 flex-1">
                                    <span class="block text-[0.62rem] font-bold uppercase tracking-[0.14em] text-graphite/45">Plant model</span>
                                    <span class="mt-1 block truncate font-semibold text-graphite/75">{plantLabel(simulation)}</span>
                                    <span class="mt-0.5 block text-[0.65rem] leading-relaxed text-graphite/45">Plant configuration used in this simulation</span>
                                  </span>
                                  <span class="grid size-8 shrink-0 place-items-center self-center rounded-full bg-sky-mist/55 text-citadel-blue transition group-hover:bg-citadel-blue group-hover:text-cloud-white"><Eye class="size-4" /></span>
                                </button>
                              )}
                            </Show>
                            <HistoryCardRow
                              icon={<Wind />}
                              label={windowsLabel(simulation)}
                              muted={!simulation.openWindows}
                            />
                            <HistoryCardRow
                              icon={<Gauge />}
                              label={co2ControlLabel(simulation)}
                              muted={!simulation.co2Control}
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          aria-label={`Delete ${simulation.name}`}
                          title="Delete simulation"
                          disabled={removeSimulation.isPending}
                          onClick={() =>
                            confirmDelete(simulation.id, simulation.name)
                          }
                          class="absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-lg border border-red-wine/15 bg-cloud-white text-red-wine transition hover:bg-red-wine hover:text-cloud-white disabled:opacity-40"
                        >
                          <Trash2 class="size-3.5" />
                        </button>
                      </div>
                    )}
                  </For>
                </Show>
              </Show>
            </Show>
            </Suspense>
          </div>
        </aside>

        <section class="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-cloud-white/55 bg-cloud-white/92 shadow-xl">
              <Suspense fallback={<HistoryResultsLoading />}>
              <Show
                when={selected()}
                fallback={
                  <div class="m-4 grid min-h-96 place-items-center rounded-2xl border border-dashed border-warm-stone/30 text-center text-sm text-graphite/45 sm:m-5">
                    <div>
                      <Clock3 class="mx-auto mb-3 size-10 text-citadel-blue/55" />
                      Select a simulation to inspect every timestamp.
                    </div>
                  </div>
                }
              >
                {(simulation) => (
                  <div class="h-full min-h-0">
                    <Show
                      when={!results.isPending}
                      fallback={<HistoryResultsLoading />}
                    >
                      <Show
                        when={!results.isError}
                        fallback={
                          <p class="m-4 rounded-xl bg-red-wine/5 p-4 text-sm text-red-wine sm:m-5">
                            Results could not be loaded.
                          </p>
                        }
                      >
                        <SimulationDataView
                          simulation={simulation()}
                          timesteps={results.data?.timesteps ?? []}
                        />
                      </Show>
                    </Show>
                  </div>
                )}
              </Show>
              </Suspense>
        </section>
        <Show when={snapshotSimulation()} keyed>
          {simulation => <ConstructionSnapshotDialog simulation={simulation} onClose={() => setSnapshotId("")} />}
        </Show>
      </main>
    </section>
  );
}

function formatDate(value?: string) {
  if (!value) return "Timestamp unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function HistoryCardRow(props: {
  icon: unknown;
  label: string;
  muted?: boolean;
}) {
  return (
    <div
      class="flex min-w-0 items-center gap-2"
      classList={{ "opacity-45": props.muted }}
    >
      <span class="shrink-0 text-citadel-blue [&>svg]:size-3.5">
        {props.icon as any}
      </span>
      <span class="truncate" title={props.label}>
        {props.label}
      </span>
    </div>
  );
}

function cityLabel(city?: string) {
  if (!city) return "Unknown city";
  return city.charAt(0).toUpperCase() + city.slice(1);
}

function statusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function plantLabel(simulation: SimulationListItem) {
  const plant = simulation.plantSimulation;
  if (!plant) return "Green wall disabled";
  const size = plant.greenWallSize
    ? plant.greenWallSize.toLowerCase().replace("_", " ")
    : "legacy";
  const exchange =
    plant.exchangeMode === "UPTAKE_ONLY" ? "uptake-only" : "full exchange";
  return `${plant.plantName} · ${size} green wall · ${(plant.lightingLevel ?? "MEDIUM").toLowerCase().replace("_", " ")} light · ${exchange}`;
}

function windowsLabel(simulation: SimulationListItem) {
  const windows = simulation.openWindows;
  if (!windows) return "Open windows disabled";
  const strategy = windows.openingStrategy === "ON_OFF" ? "On–Off" : "Linear";
  return `${strategy} · ${windows.co2ThresholdPpm} ppm · ±${windows.temperatureMarginC} °C`;
}

function co2ControlLabel(simulation: SimulationListItem) {
  const control = simulation.co2Control;
  if (!control) return "CO₂ control disabled";
  return `Mechanical ventilation DCV · ${control.setpointPpm} ppm`;
}

function Loading(props: { label: string }) {
  return (
    <div class="flex min-h-24 items-center justify-center text-sm text-graphite/50">
      <LoaderCircle class="mr-2 size-4 animate-spin" />
      {props.label}
    </div>
  );
}

function HistoryResultsLoading() {
  return (
    <div class="m-4 grid min-h-96 place-items-center rounded-2xl border border-dashed border-warm-stone/30 text-center sm:m-5">
      <div>
        <LoaderCircle class="mx-auto mb-3 size-9 animate-spin text-citadel-blue/65" />
        <p class="font-bold text-graphite">Loading simulation results</p>
        <p class="mt-1 text-sm text-graphite/50">
          Preparing the selected simulation charts.
        </p>
      </div>
    </div>
  );
}
