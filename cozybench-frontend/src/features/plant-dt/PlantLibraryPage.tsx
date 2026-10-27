import { createQuery } from "@tanstack/solid-query";
import {
  Box,
  Download,
  Leaf,
  LoaderCircle,
  Trash2,
} from "lucide-solid";
import { For, Show, createSignal } from "solid-js";
import WorkspaceHeader from "../../components/layout/WorkspaceHeader";
import PlantModelPanel from "./PlantModelPanel";
import { deletePlant, downloadPlantJson, loadPlantLibrary } from "./plantDtService";

export default function PlantLibraryPage() {
  const [selectedId, setSelectedId] = createSignal("");
  const [deletingId, setDeletingId] = createSignal("");
  const [deleteError, setDeleteError] = createSignal("");
  const [exportingId, setExportingId] = createSignal("");
  const [exportError, setExportError] = createSignal("");
  const plants = createQuery(() => ({
    queryKey: ["plant-dt", "library"],
    queryFn: loadPlantLibrary,
  }));

  const selectedPlant = () =>
    plants.data?.find((plant) => plant.id === selectedId());

  const exportPlant = async (plantId: string) => {
    setExportError("");
    setExportingId(plantId);
    try {
      await downloadPlantJson(plantId);
    } catch {
      setExportError("The plant JSON could not be downloaded.");
    } finally {
      setExportingId("");
    }
  };

  const removePlant = async (plantId: string, plantName: string) => {
    if (
      !window.confirm(
        `Delete plant "${plantName}" and all of its generated profiles?`,
      )
    ) {
      return;
    }
    setDeletingId(plantId);
    setDeleteError("");
    try {
      await deletePlant(plantId);
      if (selectedId() === plantId) setSelectedId("");
      await plants.refetch();
    } catch {
      setDeleteError("The plant could not be deleted.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <section class="mx-auto flex h-[calc(100vh-10rem)] min-h-0 w-full max-w-6xl flex-col gap-4 lg:h-[calc(100vh-4rem)]">
      <WorkspaceHeader
        eyebrow="Plant digital twins"
        title="Plant library"
        backTo="/create-plant-dt"
      />

      <main class="grid min-h-0 flex-1 gap-4 lg:grid-cols-[21rem_minmax(0,1fr)]">
        <aside class="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-cloud-white/45 bg-cloud-white/95 p-4 shadow-xl">
          <div class="mb-3 flex items-center gap-2 text-citadel-blue">
            <Leaf class="size-5" />
            <div>
              <h2 class="text-sm font-bold uppercase tracking-[0.14em]">
                Available plants
              </h2>
              <p class="mt-0.5 text-xs text-graphite/45">
                Completed plant models
              </p>
            </div>
          </div>

          <div class="cozy-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            <Show when={plants.isPending}>
              <div class="flex items-center gap-2 p-3 text-sm text-graphite/55">
                <LoaderCircle class="size-4 animate-spin" /> Loading plants…
              </div>
            </Show>
            <Show when={plants.isError}>
              <p class="rounded-xl bg-error/8 p-3 text-sm text-error">
                The plant library could not be loaded.
              </p>
            </Show>
            <Show when={deleteError()}>
              <p class="rounded-xl bg-error/8 p-3 text-sm text-error">
                {deleteError()}
              </p>
            </Show>
            <Show when={exportError()}>
              <p role="alert" class="rounded-xl bg-error/8 p-3 text-sm text-error">
                {exportError()}
              </p>
            </Show>
            <Show
              when={
                !plants.isPending &&
                !plants.isError &&
                plants.data?.length === 0
              }
            >
              <p class="rounded-xl bg-sky-mist/15 p-3 text-sm text-graphite/55">
                No completed plants are available yet.
              </p>
            </Show>
            <For each={plants.data ?? []}>
              {(plant) => (
                <div
                  class="flex w-full min-w-0 items-center rounded-xl border transition-colors"
                  classList={{
                    "border-citadel-blue bg-citadel-blue text-cloud-white shadow-md":
                      selectedId() === plant.id,
                    "border-warm-stone/20 bg-cloud-white text-graphite hover:border-citadel-blue/45 hover:bg-sky-mist/15":
                      selectedId() !== plant.id,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(plant.id);
                    }}
                    title={plant.name}
                    class="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left"
                  >
                    <Leaf class="size-4 shrink-0" />
                    <span class="min-w-0 break-words text-sm font-semibold [overflow-wrap:anywhere]">
                      {plant.name}
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Download ${plant.name} as JSON`}
                    title={`Download ${plant.name} as JSON`}
                    disabled={Boolean(exportingId())}
                    onClick={() => void exportPlant(plant.id)}
                    class="grid size-8 shrink-0 place-items-center rounded-lg text-current/65 transition hover:bg-citadel-blue/15 hover:text-current disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <Show
                      when={exportingId() === plant.id}
                      fallback={<Download class="size-4" />}
                    >
                      <LoaderCircle class="size-4 animate-spin" />
                    </Show>
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${plant.name}`}
                    title={`Delete ${plant.name}`}
                    disabled={Boolean(deletingId())}
                    onClick={() => void removePlant(plant.id, plant.name)}
                    class="mr-2 grid size-8 shrink-0 place-items-center rounded-lg text-current/65 transition hover:bg-error hover:text-cloud-white disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <Show
                      when={deletingId() === plant.id}
                      fallback={<Trash2 class="size-4" />}
                    >
                      <LoaderCircle class="size-4 animate-spin" />
                    </Show>
                  </button>
                </div>
              )}
            </For>
          </div>
        </aside>

        <section class="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-cloud-white/45 bg-cloud-white/95 p-5 shadow-xl sm:p-6">
          <Show
            when={selectedPlant()}
            fallback={
              <div class="grid min-h-0 flex-1 place-items-center rounded-2xl border border-dashed border-warm-stone/30 bg-sky-mist/10 p-8 text-center">
                <div>
                  <Box class="mx-auto size-11 text-citadel-blue/50" />
                  <h2 class="mt-4 text-lg font-bold text-graphite">
                    Select a plant
                  </h2>
                  <p class="mt-1 text-sm text-graphite/50">
                    Choose a completed model from the library to inspect it in
                    3D.
                  </p>
                </div>
              </div>
            }
          >
            {(plant) => <PlantModelPanel plant={plant()} />}
          </Show>
        </section>
      </main>

    </section>
  );
}
