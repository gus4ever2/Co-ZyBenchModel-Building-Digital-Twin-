import {
  createMutation,
  createQuery,
  useQueryClient,
} from "@tanstack/solid-query";
import { Link } from "@tanstack/solid-router";
import { Ban, LoaderCircle, PlayCircle } from "lucide-solid";
import { Show } from "solid-js";
import WorkspaceHeader from "../../components/layout/WorkspaceHeader";
import CurrentSimulationDataView from "./CurrentSimulationDataView";
import SimulationSetupCard from "./SimulationSetupCard";
import { cancelSimulation, loadCurrentSimulation } from "./simulationsService";

export default function CurrentSimulationPage() {
  const queryClient = useQueryClient();
  const current = createQuery(() => ({
    queryKey: ["simulations", "current"],
    queryFn: loadCurrentSimulation,
    refetchInterval: 1000,
  }));
  const cancel = createMutation(() => ({
    mutationFn: cancelSimulation,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["simulations"] }),
  }));

  return (
    <section class="mx-auto flex h-[calc(100vh-10rem)] min-h-0 w-full max-w-7xl flex-col gap-4 lg:h-[calc(100vh-4rem)]">
      <WorkspaceHeader eyebrow="Simulation monitor" title="Current simulation">
        <Show when={current.data?.simulation}>
          {(simulation) => (
            <div class="ml-auto flex items-center gap-3">
              <span class="hidden rounded-full bg-citadel-blue px-3 py-1 text-xs font-bold sm:inline-flex">
                {simulation().status === "PENDING"
                  ? "Warm-up · Pending"
                  : `${simulation().status} · ${simulation().progress}%`}
              </span>
              <button
                type="button"
                disabled={cancel.isPending}
                onClick={() => cancel.mutate(simulation().id)}
                class="flex items-center gap-2 rounded-xl bg-red-wine px-3 py-2 text-sm font-bold text-cloud-white disabled:opacity-50"
              >
                <Ban class="size-4" /> Cancel
              </button>
            </div>
          )}
        </Show>
      </WorkspaceHeader>

      <main class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-cloud-white/55 bg-cloud-white/92 shadow-2xl">
        <Show
          when={!current.isPending}
          fallback={<Loading label="Loading current simulation" />}
        >
          <Show
            when={!current.isError}
            fallback={
              <ErrorState label="The current simulation could not be loaded from Spring." />
            }
          >
            <Show
              when={current.data}
              fallback={
                <div class="m-4 grid min-h-96 place-items-center rounded-2xl border border-dashed border-warm-stone/30 bg-sky-mist/10 text-center sm:m-5">
                  <div>
                    <PlayCircle class="mx-auto size-11 text-citadel-blue/55" />
                    <h2 class="mt-3 text-lg font-bold text-graphite">
                      No active simulation
                    </h2>
                    <p class="mt-1 text-sm text-graphite/50">
                      Start a reference simulation to monitor live timesteps.
                    </p>
                    <Link
                      to="/new-simulation/reference"
                      class="mt-4 inline-flex rounded-xl bg-citadel-blue px-4 py-2.5 text-sm font-bold text-cloud-white"
                    >
                      New simulation
                    </Link>
                  </div>
                </div>
              }
            >
              {(value) => (
                <div class="relative flex h-full min-h-0 flex-col">
                  <div class="relative z-20 shrink-0 px-4 pt-4 pb-4 sm:px-5 sm:pt-5 sm:pb-4">
                    <SimulationSetupCard simulation={value().simulation} />
                  </div>
                  <div class="cozy-scrollbar relative z-0 min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-5 sm:pb-5">
                    <Show
                      when={value().latestTimestep}
                      fallback={<WarmUpState simulation={value().simulation} />}
                    >
                      <CurrentSimulationDataView
                        simulation={value().simulation}
                        timestep={value().latestTimestep}
                      />
                    </Show>
                  </div>
                </div>
              )}
            </Show>
          </Show>
        </Show>
      </main>
    </section>
  );
}

function Loading(props: { label: string }) {
  return (
    <div class="m-4 flex min-h-64 items-center justify-center text-sm text-graphite/55 sm:m-5">
      <LoaderCircle class="mr-2 size-5 animate-spin" />
      {props.label}
    </div>
  );
}

function ErrorState(props: { label: string }) {
  return (
    <div class="m-4 rounded-2xl border border-red-wine/25 bg-red-wine/5 p-6 text-sm text-red-wine sm:m-5">
      {props.label}
    </div>
  );
}

function WarmUpState(props: {
  simulation: { status: string; progress: number };
}) {
  const isPending = () => props.simulation.status === "PENDING";
  return (
    <div class="grid min-h-64 place-items-center rounded-2xl border border-dashed border-warm-stone/30 bg-sky-mist/10 p-6 text-center">
      <div>
        <LoaderCircle class="mx-auto size-9 animate-spin text-citadel-blue/65" />
        <h2 class="mt-3 font-bold text-graphite">
          {isPending()
            ? "Simulation warm-up in progress"
            : "Waiting for live simulation data"}
        </h2>
        <p class="mt-1 text-sm text-graphite/55">
          {isPending()
            ? "The simulation is pending while EnergyPlus prepares its warm-up steps."
            : `Progress: ${props.simulation.progress}%`}
        </p>
      </div>
    </div>
  );
}
