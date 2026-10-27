import { createQuery } from "@tanstack/solid-query";
import { LoaderCircle, X } from "lucide-solid";
import { Show, onMount } from "solid-js";
import { Portal } from "solid-js/web";
import { loadPlant } from "./plantDtService";
import PlantModelPanel from "./PlantModelPanel";

export default function PlantModelDialog(props: { plantId: string; onClose: () => void }) {
  let dialog!: HTMLDialogElement;
  const plant = createQuery(() => ({
    queryKey: ["plant-dt", "preview", props.plantId],
    queryFn: () => loadPlant(props.plantId),
  }));
  onMount(() => dialog.showModal());
  return (
    <Portal>
      <dialog ref={dialog} onClose={props.onClose}
        onClick={event => { if (event.target === dialog) props.onClose(); }}
        class="m-auto h-[min(50rem,90dvh)] w-[min(64rem,94vw)] max-w-none overflow-hidden rounded-3xl border border-warm-stone/20 bg-cloud-white p-0 shadow-2xl backdrop:bg-black/50"
        aria-label="Plant model preview">
        <div class="relative flex h-full min-h-0 flex-col p-5 pt-12 sm:p-6 sm:pt-12">
          <button type="button" aria-label="Close plant preview" onClick={props.onClose}
            class="absolute right-4 top-3 rounded-lg p-1 text-graphite/55 hover:bg-sky-mist/30">
            <X class="size-5" />
          </button>
          <Show when={!plant.isPending} fallback={<LoaderCircle class="m-auto size-8 animate-spin text-citadel-blue" />}>
            <Show when={!plant.isError && plant.data}
              fallback={<p role="alert" class="m-auto text-sm text-red-wine">Plant preview could not be loaded.</p>}>
              {data => <PlantModelPanel plant={data()} />}
            </Show>
          </Show>
        </div>
      </dialog>
    </Portal>
  );
}
