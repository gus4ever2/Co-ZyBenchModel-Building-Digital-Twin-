import { Link } from "@tanstack/solid-router";
import { ArrowLeft } from "lucide-solid";
import { Show, type JSX } from "solid-js";

type WorkspaceHeaderProps = {
  eyebrow: string;
  title: string;
  backTo?: string;
  onBack?: () => void;
  backDisabled?: boolean;
  children?: JSX.Element;
  class?: string;
};

export default function WorkspaceHeader(props: WorkspaceHeaderProps) {
  const backClass =
    "flex size-10 shrink-0 items-center justify-center rounded-full bg-citadel-blue hover:bg-citadel-blue/85 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <header
      class={`flex h-20 shrink-0 items-center gap-4 rounded-3xl border border-cloud-white/20 bg-graphite/75 px-5 text-cloud-white shadow-xl backdrop-blur-xl ${props.class ?? ""}`}
    >
      <Show
        when={props.backTo}
        fallback={
          <Show when={props.onBack}>
            <button
              type="button"
              onClick={props.onBack}
              disabled={props.backDisabled}
              class={backClass}
              aria-label="Back"
            >
              <ArrowLeft class="size-5" />
            </button>
          </Show>
        }
      >
        {(backTo) => (
          <Link to={backTo()} class={backClass} aria-label="Back">
            <ArrowLeft class="size-5" />
          </Link>
        )}
      </Show>

      <div class="min-w-0 shrink-0">
        <p class="truncate text-xs font-semibold uppercase tracking-[0.18em] text-sky-mist">
          {props.eyebrow}
        </p>
        <h1 class="truncate text-2xl font-bold leading-tight">{props.title}</h1>
      </div>
      {props.children}
    </header>
  );
}
