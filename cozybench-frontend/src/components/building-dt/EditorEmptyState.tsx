import type { JSX } from "solid-js";

type EditorEmptyStateProps = {
  icon: JSX.Element;
  title: string;
  description: string;
};

/** Shared empty state for every Building DT editor workspace. */
export default function EditorEmptyState(props: EditorEmptyStateProps) {
  return (
    <div class="flex min-h-[28rem] flex-col items-center justify-center text-center">
      <span class="mb-4 flex size-14 items-center justify-center rounded-2xl bg-sky-mist/30 text-citadel-blue">
        {props.icon}
      </span>
      <h2 class="text-xl font-bold text-graphite">{props.title}</h2>
      <p class="mt-2 max-w-md text-sm leading-6 text-graphite/55">
        {props.description}
      </p>
    </div>
  );
}
