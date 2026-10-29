import { Link } from "@tanstack/solid-router";
import { ArrowRight, type LucideProps } from "lucide-solid";
import { Show, type Component } from "solid-js";

type WorkspaceNavigationCardProps = {
  title: string;
  description: string;
  icon: Component<LucideProps>;
} & (
  | {
      to:
        | "/create-building-dt/constructions"
        | "/create-building-dt/constructions/materials"
        | "/create-building-dt/constructions/construction-sets"
        | "/create-building-dt/constructions/construction-editor"
        | "/create-building-dt/floorplan"
        | "/create-plant-dt/create"
        | "/create-plant-dt/library";
      onClick?: never;
    }
  | { to?: never; onClick: () => void }
);

const cardClass =
  "group flex h-28 items-center gap-3 rounded-2xl border border-warm-stone/25 bg-cloud-white/95 p-4 text-left shadow-lg shadow-black/10 backdrop-blur-xl hover:border-citadel-blue/50 hover:bg-cloud-white";

function CardContent(props: WorkspaceNavigationCardProps) {
  return (
    <>
      <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-mist/25 text-citadel-blue">
        <props.icon class="size-5" aria-hidden="true" />
      </span>
      <span class="min-w-0 flex-1">
        <span class="block font-bold text-graphite">{props.title}</span>
        <span class="mt-1 line-clamp-2 block text-xs leading-5 text-graphite/55">
          {props.description}
        </span>
      </span>
      <span class="flex size-8 shrink-0 items-center justify-center rounded-full border border-citadel-blue/20 text-citadel-blue group-hover:bg-citadel-blue group-hover:text-cloud-white">
        <ArrowRight class="size-3.5" aria-hidden="true" />
      </span>
    </>
  );
}

export default function WorkspaceNavigationCard(
  props: WorkspaceNavigationCardProps,
) {
  return (
    <Show
      when={"onClick" in props && props.onClick}
      fallback={
        <Link to={props.to!} class={cardClass}>
          <CardContent {...props} />
        </Link>
      }
    >
      <button type="button" onClick={() => props.onClick?.()} class={cardClass}>
        <CardContent {...props} />
      </button>
    </Show>
  );
}
