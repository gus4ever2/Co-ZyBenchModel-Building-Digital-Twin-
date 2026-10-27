import { Info } from "lucide-solid";
import {Show} from "solid-js";

type WorkspaceIntroPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  class?: string;
  info?: {
    onOpen: () => void;
  };
};

export default function WorkspaceIntroPanel(props: WorkspaceIntroPanelProps) {
  return (
    <section
      class={`relative rounded-2xl border border-citadel-blue/15 bg-sky-mist/15 p-5 sm:p-6 ${props.class ?? ""}`}
    >
      <p class="text-xs font-bold uppercase tracking-[0.18em] text-citadel-blue">
        {props.eyebrow}
      </p>
      <div class="flex items-center gap-2">
        <h2 class="text-2xl font-bold text-graphite">
          {props.title}
        </h2>
        <Show when={props.info}>
          <button
            type="button"
            class="rounded-md text-graphite/50 transition hover:text-citadel-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-citadel-blue/50"
            aria-label={`Show information about ${props.title}`}
            onClick={() => props.info?.onOpen()}
          >
            <Info size={20} class="translate-y-0.5" />
          </button>
        </Show>
      </div>
      <p class="mt-3 max-w-3xl text-sm leading-6 text-graphite/60">
        {props.description}
      </p>
    </section>
  );
}
