import { createEffect, onCleanup, Show } from "solid-js";
import { CheckCircle2, CircleAlert, X } from "lucide-solid";

/** An operation notification that does not affect the editor layout. */
export default function EditorNotification(props: {
  message: string;
  error?: boolean;
  onDismiss: () => void;
}) {
  createEffect(() => {
    if (!props.message) return;
    const timer = window.setTimeout(() => props.onDismiss(), 6000);
    onCleanup(() => window.clearTimeout(timer));
  });

  return (
    <Show when={props.message}>
      <div
        role={props.error ? "alert" : "status"}
        class="fixed right-5 top-5 z-50 flex w-[min(24rem,calc(100vw-2.5rem))] items-start gap-3 rounded-xl border border-warm-stone/20 bg-cloud-white p-4 text-sm text-graphite shadow-xl"
      >
        <Show when={props.error} fallback={<CheckCircle2 class="size-5 shrink-0 text-citadel-blue" />}>
          <CircleAlert class="size-5 shrink-0 text-error" />
        </Show>
        <span class="min-w-0 flex-1">{props.message}</span>
        <button type="button" aria-label="Dismiss notification" class="text-graphite/50 hover:text-graphite" onClick={props.onDismiss}>
          <X class="size-4" />
        </button>
      </div>
    </Show>
  );
}
