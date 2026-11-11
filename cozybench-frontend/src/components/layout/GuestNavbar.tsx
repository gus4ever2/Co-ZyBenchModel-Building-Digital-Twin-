import { Link } from "@tanstack/solid-router";
import {
  ChartNoAxesCombined,
  ChartLine,
  History,
  Info,
  Menu,
  PlayCircle,
  X,
} from "lucide-solid";
import { For, Show, createSignal } from "solid-js";

const links = [
  { label: "Compare simulations", to: "/guest/simulations", icon: ChartNoAxesCombined },
  { label: "Current simulation", to: "/guest/current-simulation", icon: ChartLine },
  { label: "New simulation", to: "/guest/new-simulation", icon: PlayCircle },
  { label: "History", to: "/guest/history", icon: History },
  { label: "About", to: "/guest/about", icon: Info },
] as const;

export default function GuestNavbar() {
  const [mobileOpen, setMobileOpen] = createSignal(false);
  const close = () => setMobileOpen(false);

  return (
    <>
      <button
        type="button"
        class="fixed left-4 top-4 z-[60] flex size-11 items-center justify-center rounded-xl border border-cloud-white/20 bg-graphite/80 text-cloud-white shadow-xl backdrop-blur-xl lg:hidden"
        aria-label={mobileOpen() ? "Close navigation" : "Open navigation"}
        onClick={() => setMobileOpen((value) => !value)}
      >
        <Show when={mobileOpen()} fallback={<Menu class="size-5" />}>
          <X class="size-5" />
        </Show>
      </button>

      <Show when={mobileOpen()}>
        <button
          type="button"
          class="fixed inset-0 z-40 bg-graphite/55 backdrop-blur-sm lg:hidden"
          aria-label="Close navigation overlay"
          onClick={close}
        />
      </Show>

      <aside
        class="fixed bottom-4 left-4 top-4 z-50 flex w-60 flex-col overflow-hidden rounded-3xl border-2 border-cloud-white/20 bg-graphite/70 p-3 text-cloud-white shadow-2xl shadow-black/30 backdrop-blur-xl transition-transform duration-300"
        classList={{ "-translate-x-[calc(100%+2rem)] lg:translate-x-0": !mobileOpen(), "translate-x-0": mobileOpen() }}
      >
        <Link
          to="/guest/new-simulation"
          onClick={close}
          class="flex h-14 items-center gap-3 rounded-xl px-2"
          aria-label="CozyBench guest workspace"
        >
          <img src="/cozybench_icon.svg" alt="" class="size-9 shrink-0" />
          <span class="text-lg font-semibold tracking-tight">CozyBench</span>
        </Link>

        <nav class="mt-5" aria-label="Guest navigation">
          <ul class="space-y-1">
            <For each={links}>
              {(item) => (
                <li>
                  <Link
                    to={item.to}
                    onClick={close}
                    class="flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-cloud-white/75 hover:bg-cloud-white/10 hover:text-cloud-white data-[status=active]:bg-citadel-blue data-[status=active]:text-cloud-white"
                  >
                    <item.icon class="size-5 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )}
            </For>
          </ul>
        </nav>

        <div class="mt-auto rounded-2xl border border-cloud-white/10 bg-cloud-white/5 p-3">
          <p class="text-xs font-semibold uppercase tracking-wider text-cloud-white/45">
            Guest session
          </p>
          <p class="mt-1 text-sm leading-5 text-cloud-white/75">
            Your simulations are available in this browser session.
          </p>
        </div>
      </aside>
    </>
  );
}
