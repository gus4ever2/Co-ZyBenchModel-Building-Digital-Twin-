import type { JSX } from "solid-js";

export default function ConstructionSetSlotCard(props: {
  label: string;
  children: JSX.Element;
}) {
  return (
    <article class="relative min-h-36 rounded-2xl border border-warm-stone/20 bg-sky-mist/8 p-4">
      <p class="mb-3 text-sm font-bold text-graphite">{props.label}</p>
      {props.children}
    </article>
  );
}
