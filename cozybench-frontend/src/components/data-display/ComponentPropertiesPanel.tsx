import { For, Show } from "solid-js";

export default function ComponentPropertiesPanel(props: {
  open: boolean;
  properties: [string, string | null][];
}) {
  return (
    <Show when={props.open}>
      <div class="cozy-scrollbar absolute left-0 right-0 top-[calc(100%+0.35rem)] z-30 max-h-72 overflow-y-auto rounded-xl border border-citadel-blue/20 bg-cloud-white px-3 py-2 shadow-2xl">
        <Show
          when={props.properties.length}
          fallback={
            <p class="py-2 text-xs text-graphite/40">No stored properties.</p>
          }
        >
          <For each={props.properties}>
            {([key, value]) => (
              <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 border-b border-warm-stone/10 py-2 text-[0.68rem] last:border-0">
                <span class="break-words text-graphite/50">{key}</span>
                <span class="break-words text-right font-semibold text-graphite/75">
                  {value ?? "—"}
                </span>
              </div>
            )}
          </For>
        </Show>
      </div>
    </Show>
  );
}
