import { ChevronDown, X } from "lucide-solid";

export default function ConstructionAssignmentCard(props: {
  name: string;
  onRemove?: () => void;
  onClick?: () => void;
  expanded?: boolean;
  changed?: boolean;
}) {
  const content = (
    <>
      <span
        title={props.name}
        class="min-w-0 flex-1 break-words text-left text-sm font-semibold leading-5"
        classList={{
          "text-red-wine": props.changed,
          "text-graphite": !props.changed,
        }}
      >
        {props.name}
      </span>
      {props.onClick ? (
        <ChevronDown
          class="size-4 shrink-0 text-citadel-blue transition-transform"
          classList={{ "rotate-180": props.expanded }}
        />
      ) : null}
    </>
  );

  const className =
    "flex w-full items-start gap-2 rounded-xl border border-citadel-blue/25 bg-citadel-blue/8 p-3";

  return props.onRemove ? (
    <div class={className}>
      <span
        title={props.name}
        class="min-w-0 flex-1 break-words text-left text-sm font-semibold leading-5 text-graphite"
      >
        {props.name}
      </span>
      <button
        type="button"
        aria-label={`Remove ${props.name}`}
        class="flex size-7 shrink-0 items-center justify-center rounded-full bg-citadel-blue text-cloud-white"
        onClick={props.onRemove}
      >
        <X class="size-3.5" />
      </button>
    </div>
  ) : (
    <button
      type="button"
      aria-expanded={props.onClick ? Boolean(props.expanded) : undefined}
      onClick={props.onClick}
      class={`${className} text-left transition hover:bg-citadel-blue/12`}
    >
      {content}
    </button>
  );
}
