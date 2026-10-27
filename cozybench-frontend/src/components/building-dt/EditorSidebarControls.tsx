import type { JSX } from "solid-js";
import { Show } from "solid-js";
import { Plus } from "lucide-solid";

type EditorAccordionProps = {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: JSX.Element;
  fillWhenOpen?: boolean;
};

/** One accordion implementation shared by all Building DT side panels. */
export function EditorAccordion(props: EditorAccordionProps) {
  return (
    <div
      class="flex min-h-0 flex-col overflow-hidden rounded-xl border border-warm-stone/20"
      classList={{ "flex-1": Boolean(props.fillWhenOpen && props.open) }}
    >
      <button
        type="button"
        class="flex w-full shrink-0 items-center justify-between bg-sky-mist/20 px-3 py-2 text-left text-xs font-semibold text-graphite"
        onClick={props.onToggle}
      >
        <span>{props.label}</span>
        <span class="text-citadel-blue">{props.open ? "−" : "+"}</span>
      </button>
      <Show when={props.open}>
        <div class="min-h-0 border-t border-warm-stone/15">
          {props.children}
        </div>
      </Show>
    </div>
  );
}

export function EditorCreateButton(props: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      class="relative flex w-full shrink-0 items-center justify-center rounded-lg bg-citadel-blue px-9 py-2 text-center text-xs font-semibold leading-none text-cloud-white hover:bg-citadel-blue/90"
      onClick={props.onClick}
    >
      <Plus class="absolute left-3 size-4" />
      <span class="block w-full text-center">{props.label}</span>
    </button>
  );
}
