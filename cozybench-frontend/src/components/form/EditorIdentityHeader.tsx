import type { JSX } from "solid-js";

type EditorIdentityHeaderProps = {
  eyebrow: string;
  title: string;
  actions?: JSX.Element;
};

/** Shared identity header for metadata-driven Building DT editors. */
export default function EditorIdentityHeader(props: EditorIdentityHeaderProps) {
  return (
    <header class="mb-5 flex shrink-0 flex-wrap items-start justify-between gap-3 border-b border-warm-stone/20 pb-5">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.16em] text-citadel-blue">
          {props.eyebrow}
        </p>
        <h2 class="mt-1 text-2xl font-bold text-graphite">{props.title}</h2>
      </div>
      {props.actions}
    </header>
  );
}
