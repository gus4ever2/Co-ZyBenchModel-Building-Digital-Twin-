import type { ParentProps } from "solid-js";

/** Shared responsive shell used by the Building DT editors. */
export default function EditorWorkspace(props: ParentProps) {
  return (
    <section class="min-h-0 xl:h-full">
      <div class="grid gap-4 xl:h-full xl:min-h-0 xl:grid-cols-[17rem_minmax(0,1fr)_17rem]">
        {props.children}
      </div>
    </section>
  );
}

/** Left or right sidebar inside an editor workspace. */
export function EditorSidebar(props: ParentProps) {
  return (
    <aside class="flex min-h-[30rem] flex-col overflow-hidden rounded-3xl border border-cloud-white/35 bg-cloud-white/95 p-4 shadow-xl backdrop-blur-xl xl:min-h-0">
      {props.children}
    </aside>
  );
}

/** Central editing surface inside an editor workspace. */
export function EditorMain(props: ParentProps) {
  return (
    <main class="min-h-[34rem] overflow-hidden rounded-3xl border border-cloud-white/35 bg-cloud-white/95 p-5 shadow-xl backdrop-blur-xl sm:p-7 xl:min-h-0">
      {props.children}
    </main>
  );
}
