import { createQuery } from "@tanstack/solid-query";
import { Link } from "@tanstack/solid-router";
import {
  BrickWall,
  Building2,
  ChartNoAxesCombined,
  ChevronRight,
  Clock3,
  Cuboid,
  Gauge,
  GitCompareArrows,
  Leaf,
  LoaderCircle,
  MapPin,
  PackageOpen,
  PanelsTopLeft,
  PlusCircle,
  Wind,
} from "lucide-solid";
import { For, Show, createMemo } from "solid-js";
import WorkspaceHeader from "../../components/layout/WorkspaceHeader";
import {
  loadCurrentSimulation,
  loadDashboardSummary,
  loadUserSimulations,
} from "../simulations/simulationsService";
import ClimateMap from "./ClimateMap";
import ClimateZoneLegend from "./ClimateZoneLegend";
import { dashboardMockData } from "./dashboardMockData";

export default function DashboardPage() {
  const summary = createQuery(() => ({
    queryKey: ["dashboard", "summary"],
    queryFn: loadDashboardSummary,
  }));

  const simulations = createQuery(() => ({
    queryKey: ["simulations", "all"],
    queryFn: loadUserSimulations,
  }));

  const current = createQuery(() => ({
    queryKey: ["simulations", "current"],
    queryFn: loadCurrentSimulation,
    // Fetch once on entry. Continue polling only while Spring reports an active run,
    // so an idle dashboard does not repeatedly re-render its scroll containers.
    refetchInterval: (query) => (query.state.data ? 3000 : false),
  }));

  const recent = createMemo(() => (simulations.data ?? []).slice(0, 6));

  const statistics = createMemo(() => [
    {
      label: "Total simulations",
      description: "All simulations created in your CozyBench workspace.",
      value: summary.data?.total,
      icon: ChartNoAxesCombined,
    },
    {
      label: "Open-window simulations",
      description: "Simulations using automatic natural ventilation.",
      value: summary.data?.openWindowSimulations,
      icon: Wind,
    },
    {
      label: "Plant simulations",
      description: "Simulations that include plant digital-twin models.",
      value: summary.data?.plantSimulations,
      icon: Leaf,
    },
    {
      label: "CO₂-control simulations",
      description: "Simulations using native demand-controlled ventilation.",
      value: summary.data?.co2ControlSimulations,
      icon: Gauge,
    },
    {
      label: "Construction sets",
      description: "Construction sets currently available in your workspace.",
      value: summary.data?.constructionSets,
      icon: PanelsTopLeft,
      scope: "Workspace",
    },
    {
      label: "Constructions",
      description: "EnergyPlus constructions currently in your workspace.",
      value: summary.data?.constructions,
      icon: BrickWall,
      scope: "Workspace",
    },
    {
      label: "Materials",
      description:
        "EnergyPlus materials currently available in your workspace.",
      value: summary.data?.materials,
      icon: Cuboid,
      scope: "Workspace",
    },
    {
      label: "Plant models",
      description: "Completed plant digital-twin models in your workspace.",
      value: summary.data?.plantModels,
      icon: Leaf,
      scope: "Workspace",
    },
  ]);

  return (
    <section class="mx-auto flex h-[calc(100vh-10rem)] min-h-0 w-full max-w-7xl flex-col gap-4 lg:h-[calc(100vh-4rem)]">
      <WorkspaceHeader eyebrow="CozyBench workspace" title="Dashboard" />

      <div class="cozy-scrollbar w-full min-w-0 shrink-0 overflow-x-auto overflow-y-hidden pb-1">
        <section
          class="grid w-max grid-rows-1 gap-4 pr-1"
          style={{ "grid-template-columns": "repeat(8, 19rem)" }}
        >
          <For each={statistics()}>
            {(statistic) => (
              <article class="flex h-44 flex-col rounded-3xl border border-cloud-white/50 bg-cloud-white/95 p-5 shadow-lg">
                <div class="flex items-start justify-between gap-4">
                  <div class="min-w-0">
                    <p class="whitespace-nowrap text-sm font-bold text-graphite">
                      {statistic.label}
                    </p>
                    <p class="mt-2 min-h-10 max-w-[13.5rem] text-sm leading-5 text-graphite/50">
                      {statistic.description}
                    </p>
                  </div>

                  <span class="grid size-14 shrink-0 place-items-center rounded-2xl bg-sky-mist/35 text-citadel-blue">
                    <statistic.icon class="size-7" />
                  </span>
                </div>

                <div class="mt-auto flex items-end justify-between gap-4">
                  <Show
                    when={!summary.isPending}
                    fallback={
                      <LoaderCircle class="size-6 animate-spin text-citadel-blue" />
                    }
                  >
                    <p class="text-4xl font-bold leading-none text-graphite">
                      {summary.isError ? "—" : (statistic.value ?? 0)}
                    </p>
                  </Show>

                  <Show when={"scope" in statistic && statistic.scope}>
                    <span class="rounded-full bg-citadel-blue/10 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-citadel-blue">
                      {"scope" in statistic ? statistic.scope : ""}
                    </span>
                  </Show>
                </div>
              </article>
            )}
          </For>
        </section>
      </div>

      <main class="cozy-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        <article class="overflow-hidden rounded-3xl border border-cloud-white/50 bg-cloud-white/95 shadow-xl">
          <header class="border-b border-warm-stone/15 px-5 py-4">
            <p class="text-xs font-bold uppercase tracking-widest text-citadel-blue">
              Climate locations
            </p>
            <h2 class="mt-1 text-xl font-bold text-graphite">
              CozyBench reference sites
            </h2>
            <p class="mt-1 text-sm text-graphite/55">
              Paris and Andravida with their static ASHRAE climate-zone
              classification.
            </p>
          </header>

          <div class="grid min-h-[22rem] lg:h-96 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div class="min-h-64">
              <ClimateMap locations={dashboardMockData.locations} />
            </div>
            <ClimateZoneLegend />
          </div>
        </article>

        <section class="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)]">
          <article class="rounded-3xl border border-cloud-white/50 bg-cloud-white/95 p-5 shadow-xl">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-xs font-bold uppercase tracking-widest text-citadel-blue">
                  Current activity
                </p>
                <h2 class="mt-1 text-xl font-bold text-graphite">
                  Current simulation
                </h2>
              </div>
              <ChartNoAxesCombined class="size-5 text-citadel-blue" />
            </div>

            <Show
              when={!current.isPending}
              fallback={<Loading label="Loading current simulation" />}
            >
              <Show
                when={current.data}
                fallback={
                  <div class="mt-5 rounded-2xl border border-dashed border-warm-stone/25 bg-sky-mist/10 p-6 text-center text-sm text-graphite/50">
                    No simulation is currently running.
                  </div>
                }
              >
                {(value) => (
                  <div class="mt-5">
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <p
                          class="truncate font-bold text-graphite"
                          title={value().simulation.name}
                        >
                          {value().simulation.name}
                        </p>
                        <p class="mt-1 flex items-center gap-1.5 text-sm text-graphite/55">
                          <MapPin class="size-4" />
                          {value().simulation.city ?? "Location unavailable"}
                        </p>
                        <p class="mt-1 truncate text-xs text-graphite/45">
                          {value().simulation.constructionSetName ??
                            "Construction set unavailable"}
                        </p>
                      </div>

                      <span class="shrink-0 rounded-full bg-citadel-blue/10 px-2.5 py-1 text-xs font-bold text-citadel-blue">
                        {value().simulation.status}
                      </span>
                    </div>

                    <div class="mt-4">
                      <div class="mb-1 flex justify-between text-xs text-graphite/50">
                        <span>Progress</span>
                        <span>{value().simulation.progress}%</span>
                      </div>
                      <div class="h-2 overflow-hidden rounded-full bg-sky-mist/30">
                        <div
                          class="h-full rounded-full bg-citadel-blue"
                          style={{
                            width: `${value().simulation.progress}%`,
                          }}
                        />
                      </div>
                    </div>

                    <Link
                      to="/current-simulation"
                      class="mt-5 flex items-center justify-between rounded-xl bg-graphite px-4 py-3 text-sm font-bold text-cloud-white"
                    >
                      Open live dashboard
                      <ChevronRight class="size-4" />
                    </Link>
                  </div>
                )}
              </Show>
            </Show>
          </article>

          <article class="rounded-3xl border border-cloud-white/50 bg-cloud-white/95 p-5 shadow-xl">
            <p class="text-xs font-bold uppercase tracking-widest text-citadel-blue">
              Quick actions
            </p>
            <div class="mt-4 grid grid-cols-2 gap-3">
              <Action
                to="/new-simulation"
                label="New simulation"
                icon={<PlusCircle />}
              />
              <Action
                to="/simulations"
                label="Compare"
                icon={<GitCompareArrows />}
              />
              <Action
                to="/create-building-dt"
                label="Building DT"
                icon={<Building2 />}
              />
              <Action to="/create-plant-dt" label="Plant DT" icon={<Leaf />} />
            </div>
          </article>
        </section>

        <article class="rounded-3xl border border-cloud-white/50 bg-cloud-white/95 p-5 shadow-xl">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-xs font-bold uppercase tracking-widest text-citadel-blue">
                Recent activity
              </p>
              <h2 class="mt-1 text-xl font-bold text-graphite">
                Recent simulations
              </h2>
            </div>

            <Link to="/history" class="text-sm font-bold text-citadel-blue">
              View history
            </Link>
          </div>

          <Show
            when={!simulations.isPending}
            fallback={<Loading label="Loading simulations" />}
          >
            <Show
              when={recent().length > 0}
              fallback={
                <div class="mt-5 flex min-h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-warm-stone/25 bg-sky-mist/10 text-center text-sm text-graphite/50">
                  <PackageOpen class="mb-2 size-6 text-citadel-blue" />
                  No simulations have been created yet.
                </div>
              }
            >
              <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <For each={recent()}>
                  {(simulation) => (
                    <article class="rounded-2xl border border-warm-stone/20 bg-sky-mist/8 p-4">
                      <div class="flex items-start justify-between gap-2">
                        <p
                          class="min-w-0 truncate font-bold text-graphite"
                          title={simulation.name}
                        >
                          {simulation.name}
                        </p>
                        <span class="shrink-0 rounded-full bg-graphite/7 px-2 py-1 text-[0.6rem] font-bold text-graphite/60">
                          {simulation.status}
                        </span>
                      </div>
                      <p class="mt-2 flex items-center gap-1.5 text-xs text-graphite/50">
                        <MapPin class="size-3.5" />
                        {simulation.city ?? "Location unavailable"}
                      </p>
                      <p class="mt-1 flex items-center gap-1.5 text-xs text-graphite/40">
                        <Clock3 class="size-3.5" />
                        {formatDate(
                          simulation.completedAt ??
                            simulation.startedAt ??
                            simulation.requestedAt,
                        )}
                      </p>
                    </article>
                  )}
                </For>
              </div>
            </Show>
          </Show>
        </article>
      </main>
    </section>
  );
}

function Action(props: {
  to:
    | "/new-simulation"
    | "/simulations"
    | "/create-building-dt"
    | "/create-plant-dt";
  label: string;
  icon: unknown;
}) {
  return (
    <Link
      to={props.to}
      class="flex min-h-24 flex-col justify-between rounded-xl border border-warm-stone/20 bg-sky-mist/10 p-3 font-bold text-graphite transition hover:border-citadel-blue/45 hover:bg-sky-mist/20"
    >
      <span class="text-citadel-blue">{props.icon as any}</span>
      <span class="text-sm">{props.label}</span>
    </Link>
  );
}

function Loading(props: { label: string }) {
  return (
    <div class="flex min-h-24 items-center justify-center text-sm text-graphite/50">
      <LoaderCircle class="mr-2 size-4 animate-spin" />
      {props.label}
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) {
    return "Timestamp unavailable";
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}
