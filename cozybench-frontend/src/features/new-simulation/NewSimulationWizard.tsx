import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import { useNavigate } from "@tanstack/solid-router";
import {
  ArrowRight,
  Cloud,
  Eye,
  Gauge,
  Leaf,
  LoaderCircle,
  MapPin,
  PanelsTopLeft,
  Play,
  Wind,
} from "lucide-solid";
import {
  For,
  Match,
  Show,
  Switch,
  createMemo,
  createSignal,
  lazy,
  type Component, type JSX, useContext,
} from "solid-js";
import { z } from "zod";
import axios from "axios";
import {
  loadSimulationConstructionSets,
  constructionSetClimateDescription,
  loadSimulationPlants,
  CO2_CONTROL_SETPOINT_OPTIONS,
  checkSimulationName,
  startSimulation,
  type NewSimulationPayload,
} from "./newSimulationService";
import WorkspaceHeader from "../../components/layout/WorkspaceHeader";
import WorkspaceIntroPanel from "../../components/layout/WorkspaceIntroPanel";
import EditorNotification from "../../components/building-dt/EditorNotification";

import SimulationOptionsInfo from "./info/SimulationOptionsInfo.tsx";
import {InfoModalContext} from "../../context/InfoModalContext.ts";
import {LocationInfo} from "./info/LocationInfo.tsx";
import {ConstructionSetInfo} from "./info/ConstructionSetInfo.tsx";
import GreenWallInfo from "./info/GreenWallInfo.tsx";
import OpenWindowsInfo from "./info/OpenWindowsInfo.tsx";
const PlantModelDialog = lazy(() => import("../plant-dt/PlantModelDialog"));
import Co2ControlInfo from "./info/Co2ControlInfo";

const locations = [
  { value: "paris", label: "Paris", description: "Mixed–humid climate" },
  { value: "andravida", label: "Andravida", description: "Warm–humid climate" },
  { value: "la", label: "Los Angeles", description: "Warm–dry climate" },
  { value: "mumbai", label: "Mumbai", description: "Hot–humid climate" },
  { value: "scranton", label: "Scranton", description: "Cool–humid climate" },
  { value: "beijing", label: "Beijing", description: "Mixed–humid climate" },
];

const co2Options = CO2_CONTROL_SETPOINT_OPTIONS.map((value) => ({
  value,
  label: `${value.toLocaleString("en-US")} ppm`,
  detail: "CO₂ threshold for automatic window opening",
}));

const co2ControlOptions = CO2_CONTROL_SETPOINT_OPTIONS.map((value) => ({
  value: String(value),
  label: `${value.toLocaleString("en-US")} ppm`,
  description: "Mechanical ventilation CO₂ setpoint",
}));

const schemas = {
  options: z.object({
    name: z.string().trim().min(1).max(80),
    plantsEnabled: z.boolean(),
    openWindowsEnabled: z.boolean(),
    co2ControlEnabled: z.boolean(),
  }),
  location: z.object({ location: z.string().min(1) }),
  construction: z.object({ constructionSet: z.string().min(1) }),
  plants: z.object({
    plantId: z.string().min(1),
    plantName: z.string().min(1),
    greenWallSize: z.enum(["SMALL", "MEDIUM", "LARGE", "VERY_LARGE"]),
    lightingLevel: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
    exchangeMode: z.enum(["FULL_EXCHANGE", "UPTAKE_ONLY"]),
  }),
  windows: z.object({
    openingStrategy: z.enum(["LINEAR", "ON_OFF"]),
    minCo2Level: z.union([
      z.literal(500),
      z.literal(600),
      z.literal(700),
      z.literal(800),
      z.literal(900),
      z.literal(1000),
    ]),
    temperatureMargin: z.number().min(0.1).max(10),
  }),
  co2Control: z.object({
    co2SetpointPpm: z.union([
      z.literal(500),
      z.literal(600),
      z.literal(700),
      z.literal(800),
      z.literal(900),
      z.literal(1000),
    ]),
  }),
};

type StepId =
  | "options"
  | "location"
  | "construction"
  | "plants"
  | "windows"
  | "co2Control"
  | "review";

type Step = {
  id: StepId;
  label: string;
  eyebrow: string;
  description: string;
  info?: Component;
};

export default function NewSimulationWizard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [stepIndex, setStepIndex] = createSignal(0);
  const [previewPlantId, setPreviewPlantId] = createSignal("");
  const [form, setForm] = createSignal<NewSimulationPayload>({
    name: "",
    location: "",
    constructionSet: "",
    plantsEnabled: false,
    openWindowsEnabled: false,
    co2ControlEnabled: false,
    plantId: "",
    plantName: "",
    greenWallSize: "MEDIUM",
    lightingLevel: "MEDIUM",
    exchangeMode: "FULL_EXCHANGE",
    openingStrategy: "LINEAR",
    minCo2Level: 800,
    temperatureMargin: 2,
    co2SetpointPpm: 800,
  });

  const infoModalContextValue = useContext(InfoModalContext);

  if (!infoModalContextValue) {
    throw new Error("InfoModalContext provider is missing.");
  }

  const steps = createMemo<Step[]>(() => [
    {
      id: "options",
      label: "Options",
      eyebrow: "Simulation setup",
      description: "Choose the smart features you want to include.",
      info: SimulationOptionsInfo,
    },
    {
      id: "location",
      label: "Location",
      eyebrow: "Location",
      description: "Choose the weather and climate configuration.",
      info: LocationInfo,
    },
    {
      id: "construction",
      label: "Construction set",
      eyebrow: "Building envelope",
      description: "Select the construction set used by the building.",
      info: ConstructionSetInfo,
    },
    ...(form().plantsEnabled
      ? [
          {
            id: "plants" as const,
            label: "Green wall",
            eyebrow: "Green wall simulation",
            description:
              "Configure the green-wall model, coverage and lighting.",
            info: GreenWallInfo,
          },
        ]
      : []),
    ...(form().openWindowsEnabled
      ? [
          {
            id: "windows" as const,
            label: "Open windows",
            eyebrow: "Natural ventilation",
            description: "Define when automatic window opening is allowed.",
            info: OpenWindowsInfo,
          },
        ]
      : []),
    ...(form().co2ControlEnabled
      ? [
          {
            id: "co2Control" as const,
            label: "CO₂ control",
            eyebrow: "Mechanical ventilation",
            description:
              "Configure native EnergyPlus demand-controlled ventilation.",
            info: Co2ControlInfo,
          },
        ]
      : []),
    {
      id: "review",
      label: "Review",
      eyebrow: "Ready to simulate",
      description: "Review the configuration before starting.",
    },
  ]);
  const current = createMemo(
    () => steps()[Math.min(stepIndex(), steps().length - 1)],
  );

  const setsQuery = createQuery(() => ({
    queryKey: ["new-simulation", "construction-sets"],
    queryFn: loadSimulationConstructionSets,
  }));
  const plantsQuery = createQuery(() => ({
    queryKey: ["new-simulation", "plants"],
    queryFn: loadSimulationPlants,
    enabled: form().plantsEnabled,
  }));
  const startAction = createMutation(() => ({
    mutationFn: startSimulation,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["simulations", "current"] });
      void navigate({ to: "/current-simulation" });
    },
  }));
  const nameCheck = createMutation(() => ({
    mutationFn: async (name: string) => ({ name, available: await checkSimulationName(name) }),
  }));

  const startError = () => {
    const error = startAction.error;
    if (!axios.isAxiosError(error)) {
      return "The simulation could not be started.";
    }
    const response = error.response?.data as
      { detail?: string; title?: string } | undefined;
    return (
      response?.detail ??
      response?.title ??
      "The simulation could not be started. Check that Spring and Python are running."
    );
  };

  const valid = createMemo(() => {
    const value = form();
    switch (current().id) {
      case "options":
        return schemas.options.safeParse(value).success;
      case "location":
        return schemas.location.safeParse(value).success;
      case "construction":
        return schemas.construction.safeParse(value).success;
      case "plants":
        return schemas.plants.safeParse(value).success;
      case "windows":
        return schemas.windows.safeParse(value).success;
      case "co2Control":
        return schemas.co2Control.safeParse(value).success;
      default:
        return true;
    }
  });

  const update = <K extends keyof NewSimulationPayload>(
    key: K,
    value: NewSimulationPayload[K],
  ) => setForm((previous) => ({ ...previous, [key]: value }));
  const next = () =>
    valid() && setStepIndex((index) => Math.min(index + 1, steps().length - 1));
  const back = () => setStepIndex((index) => Math.max(index - 1, 0));

  return (
      <>
        <EditorNotification
          message={startAction.isError ? startError() : nameCheck.isError
            ? "Could not check the name. Please try again."
            : nameCheck.data?.name === form().name.trim()
              ? nameCheck.data.available ? "This name is available." : "You already have a simulation with this name."
              : ""}
          error={startAction.isError || nameCheck.isError || (nameCheck.data?.name === form().name.trim() && !nameCheck.data.available)}
          onDismiss={() => { startAction.reset(); nameCheck.reset(); }}
        />

        <section
            class="mx-auto flex h-[calc(100vh-10rem)] min-h-[38rem] w-full max-w-6xl flex-col gap-4 lg:h-[calc(100vh-4rem)] lg:min-h-0">
          <WorkspaceHeader
              eyebrow="New simulation"
              title={current().label}
              backTo={stepIndex() === 0 ? "/new-simulation" : undefined}
              onBack={stepIndex() > 0 ? back : undefined}
              class="w-full"
          >
            <div class="relative ml-auto hidden w-full max-w-3xl items-start justify-between md:flex">
              <div class="absolute left-12 right-12 top-[0.7rem] h-0.5 overflow-hidden rounded-full bg-cloud-white/20">
                <div
                    class="h-full rounded-full bg-citadel-blue"
                    style={{
                      width: `${steps().length > 1 ? (stepIndex() / (steps().length - 1)) * 100 : 0}%`,
                    }}/>
              </div>
              <For each={steps()}>
                {(_, index) => (
                    <div class="relative z-10 flex w-24 shrink-0 flex-col items-center text-center">
                      <div
                          class={`grid size-6 place-items-center rounded-full border-2 text-[10px] ${index() < stepIndex() ? "border-citadel-blue bg-citadel-blue" : index() === stepIndex() ? "border-citadel-blue bg-graphite" : "border-cloud-white/30 bg-graphite"}`}
                      >
                        {index() + 1}
                      </div>
                      <span
                          class={`mt-1 text-[0.58rem] font-bold uppercase tracking-wide ${index() <= stepIndex() ? "text-cloud-white" : "text-cloud-white/45"}`}
                      >
                                  {steps()[index()].label}
                              </span>
                    </div>
                )}
              </For>
            </div>
          </WorkspaceHeader>

          <div
              class="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col overflow-hidden rounded-[1.8rem] border border-warm-stone/25 bg-cloud-white shadow-xl">
            <div class="shrink-0 px-5 pt-7 sm:px-8">
              <WorkspaceIntroPanel
                  eyebrow={current().eyebrow}
                  title={current().label}
                  description={current().description}
                  info={current().info
                      ? {
                        onOpen: () => {
                          const info = current().info;
                          if (!info) return;
                          infoModalContextValue.setInfoModalContent(() => info);
                          infoModalContextValue.setInfoModalOpen(true);
                        },
                      }
                      : undefined}/>
            </div>

            <div class="cozy-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-8">
              <Switch>
                <Match when={current().id === "options"}>
                  <div class="space-y-6">
                    <Field
                        label="Simulation name"
                        hint="Use a short descriptive name, for example Andravida – Open windows."
                    >
                      <div class="flex max-w-xl items-center gap-2">
                        <input
                            class="form-input min-w-0 flex-1"
                            type="text"
                            maxlength="80"
                            placeholder="My new Simulation"
                            value={form().name ?? ""}
                            onInput={(event) => { update("name", event.currentTarget.value); nameCheck.reset(); }}/>
                        <button
                          type="button"
                          class="inline-flex shrink-0 items-center gap-2 rounded-xl border border-citadel-blue/30 px-4 py-2.5 text-sm font-semibold text-citadel-blue hover:bg-citadel-blue/10 disabled:opacity-50"
                          disabled={!form().name.trim() || nameCheck.isPending}
                          onClick={() => nameCheck.mutate(form().name.trim())}
                        >
                          <Show when={nameCheck.isPending}><LoaderCircle class="size-4 animate-spin" /></Show>
                          Check availability
                        </button>
                      </div>
                    </Field>
                    <div class="grid gap-4 md:grid-cols-3">
                      <ToggleCard
                          icon={<Leaf/>}
                          title="Green wall simulation"
                          description="Include a green wall and configure its model, coverage and lighting."
                          checked={form().plantsEnabled}
                          onChange={(value) => update("plantsEnabled", value)}/>
                      <ToggleCard
                          icon={<Wind/>}
                          title="Automatic open windows"
                          description="Allow natural ventilation using CO₂ and temperature conditions."
                          checked={form().openWindowsEnabled}
                          onChange={(value) => update("openWindowsEnabled", value)}/>
                      <ToggleCard
                          icon={<Gauge/>}
                          title="CO₂ control"
                          description="Control mechanical outdoor air using a native EnergyPlus CO₂ setpoint."
                          checked={form().co2ControlEnabled}
                          onChange={(value) => update("co2ControlEnabled", value)}/>
                    </div>
                  </div>
                </Match>
                <Match when={current().id === "location"}>
                  <ChoiceGrid
                      items={locations}
                      value={form().location}
                      onChange={(value) => update("location", value)}
                      icon={<MapPin size={20}/>}/>
                </Match>
                <Match when={current().id === "construction"}>
                  <QueryChoices
                      loading={setsQuery.isPending}
                      error={setsQuery.isError}
                      empty="No construction sets are available."
                  >
                    <div class="space-y-6">
                      <For each={[true, false]}>
                        {(isDefault) => (
                          <section class="space-y-3">
                            <h3 class="text-sm font-semibold text-graphite">
                              {isDefault ? "Default construction sets" : "My construction sets"}
                            </h3>
                            <ChoiceGrid
                              items={(setsQuery.data ?? []).filter(item => !!item.defaultOption === isDefault).map(item => ({
                                value: isDefault ? item.name : item.id,
                                label: item.displayName ?? item.name,
                                description: isDefault ? constructionSetClimateDescription(item.name) : "Your workspace",
                              }))}
                              value={form().constructionSet}
                              onChange={value => update("constructionSet", value)}
                              icon={<PanelsTopLeft size={20}/>}/>
                            <Show when={!isDefault && !(setsQuery.data ?? []).some(item => !item.defaultOption)}>
                              <p class="text-sm text-graphite/60">You have no personal construction sets yet.</p>
                            </Show>
                          </section>
                        )}
                      </For>
                    </div>
                  </QueryChoices>
                </Match>
                <Match when={current().id === "plants"}>
                  <QueryChoices
                      loading={plantsQuery.isPending}
                      error={plantsQuery.isError}
                      empty="No completed plant models are available."
                  >
                    <div class="grid gap-5 md:grid-cols-2">
                      <div class="space-y-6 md:col-span-2">
                        <div>
                          <h3 class="text-sm font-semibold text-graphite">Plant</h3>
                          <p class="mt-1 text-xs text-graphite/55">
                            Select one plant from Default plants or My plants.
                          </p>
                        </div>
                        <For each={[true, false]}>
                          {isDefault => (
                            <section class="space-y-3">
                              <h4 class="text-xs font-medium text-graphite/50">{isDefault ? "Default plants" : "My plants"}</h4>
                              <div class="grid gap-3 sm:grid-cols-2">
                                <For each={(plantsQuery.data ?? []).filter(plant => plant.defaultOption === isDefault)}>
                                  {plant => (
                                    <div class="relative">
                                      <button type="button" aria-pressed={form().plantId === plant.id}
                                        onClick={() => { update("plantId", plant.id); update("plantName", plant.name); }}
                                        class={`flex h-full w-full items-center gap-4 rounded-2xl border p-4 pr-14 text-left transition ${form().plantId === plant.id ? "border-citadel-blue bg-sky-mist/30 ring-2 ring-citadel-blue/10" : "border-warm-stone/25 bg-white hover:border-citadel-blue/50"}`}>
                                        <span class={`grid size-10 shrink-0 place-items-center rounded-xl ${form().plantId === plant.id ? "bg-citadel-blue text-cloud-white" : "bg-sky-mist/20 text-citadel-blue"}`}><Leaf size={20}/></span>
                                        <span class="min-w-0">
                                          <span class="block break-words font-bold text-graphite">{plant.name}</span>
                                          <span class="mt-0.5 block text-sm text-graphite/55">{isDefault ? "Default plant model" : "Your workspace"}</span>
                                        </span>
                                      </button>
                                      <button type="button" aria-label={`Preview ${plant.name}`} title="View plant model"
                                        onClick={() => setPreviewPlantId(plant.id)}
                                        class="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-sky-mist/40 text-citadel-blue hover:bg-citadel-blue hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-citadel-blue">
                                        <Eye class="size-4"/>
                                      </button>
                                    </div>
                                  )}
                                </For>
                              </div>
                              <Show when={!isDefault && !(plantsQuery.data ?? []).some(plant => !plant.defaultOption)}>
                                <p class="text-sm text-graphite/60">You have no personal plant models yet.</p>
                              </Show>
                            </section>
                          )}
                        </For>
                        <Show when={previewPlantId()}>
                          {id => <PlantModelDialog plantId={id()} onClose={() => setPreviewPlantId("")}/>}
                        </Show>
                      </div>
                      <div class="md:col-span-2">
                        <p class="mb-2 text-sm font-semibold">Wall coverage</p>
                        <ChoiceGrid
                            items={[
                              {
                                value: "SMALL",
                                label: "10%",
                                description: "10% of each zone's available wall area.",
                              },
                              {
                                value: "MEDIUM",
                                label: "30%",
                                description: "30% of each zone's available wall area.",
                              },
                              {
                                value: "LARGE",
                                label: "50%",
                                description: "50% of each zone's available wall area.",
                              },
                              {
                                value: "VERY_LARGE",
                                label: "75%",
                                description: "75% of each zone's available wall area.",
                              },
                            ]}
                            value={form().greenWallSize ?? "MEDIUM"}
                            onChange={(value) => update(
                                "greenWallSize",
                                value as "SMALL" | "MEDIUM" | "LARGE" | "VERY_LARGE"
                            )}
                            icon={<Leaf size={20}/>}/>
                        <p class="mt-2 text-xs text-graphite/50">
                          The resulting m² are calculated separately from each
                          thermal zone's available wall area.
                        </p>
                      </div>
                      <div class="md:col-span-2">
                        <p class="mb-2 text-sm font-semibold">
                          Green wall lighting
                        </p>
                        <ChoiceGrid
                            items={[
                              {
                                value: "LOW",
                                label: "Low",
                                description: "50 μmol m⁻² s⁻¹",
                              },
                              {
                                value: "MEDIUM",
                                label: "Medium",
                                description: "100 μmol m⁻² s⁻¹",
                              },
                              {
                                value: "HIGH",
                                label: "High",
                                description: "200 μmol m⁻² s⁻¹",
                              },
                              {
                                value: "VERY_HIGH",
                                label: "Very high",
                                description: "300 μmol m⁻² s⁻¹",
                              },
                            ]}
                            value={form().lightingLevel ?? "MEDIUM"}
                            onChange={(value) => update(
                                "lightingLevel",
                                value as "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH"
                            )}
                            icon={<Leaf size={20}/>}/>
                        <p class="mt-2 text-xs text-graphite/50">
                          Selected light is active from 08:00 to 22:00; PPFD is zero
                          outside that interval.
                        </p>
                      </div>
                      <div class="md:col-span-2">
                        <p class="mb-2 text-sm font-semibold">Plant CO₂ exchange</p>
                        <ChoiceGrid
                            items={[
                              {
                                value: "FULL_EXCHANGE",
                                label: "Full CO₂ exchange",
                                description: "Apply both uptake and respiration to the zone.",
                              },
                              {
                                value: "UPTAKE_ONLY",
                                label: "Uptake-only scenario",
                                description: "Apply uptake only; net respiratory emissions are excluded.",
                              },
                            ]}
                            value={form().exchangeMode ?? "FULL_EXCHANGE"}
                            onChange={(value) => update(
                                "exchangeMode",
                                value as "FULL_EXCHANGE" | "UPTAKE_ONLY"
                            )}
                            icon={<Leaf size={20}/>}/>
                        <p class="mt-2 text-xs text-graphite/50">
                          Uptake-only is an explicit sensitivity scenario, not the
                          plant's full physiology.
                        </p>
                      </div>
                    </div>
                  </QueryChoices>
                </Match>
                <Match when={current().id === "windows"}>
                  <div class="space-y-6">
                    <div>
                      <p class="mb-2 text-sm font-semibold">
                        Window opening strategy
                      </p>
                      <ChoiceGrid
                          items={[
                            {
                              value: "LINEAR",
                              label: "Linear",
                              description: "Gradually adjusts the opening factor within the temperature margin.",
                            },
                            {
                              value: "ON_OFF",
                              label: "On–Off",
                              description: "Fully opens the windows as soon as all conditions are satisfied.",
                            },
                          ]}
                          value={form().openingStrategy ?? "LINEAR"}
                          onChange={(value) => update("openingStrategy", value as "LINEAR" | "ON_OFF")}
                          icon={<Wind size={20}/>}/>
                    </div>
                    <div>
                      <p class="mb-2 text-sm font-semibold">
                        CO₂ concentration threshold
                      </p>
                      <ChoiceGrid
                          items={co2Options.map((option) => ({
                            value: String(option.value),
                            label: option.label,
                            description: option.detail,
                          }))}
                          value={String(form().minCo2Level)}
                          onChange={(value) => update(
                              "minCo2Level",
                              Number(value) as 500 | 600 | 700 | 800 | 900 | 1000
                          )}
                          icon={<Cloud size={20}/>}/>
                    </div>
                    <Field
                        label="Temperature margin from HVAC setpoint (°C)"
                        hint="Windows may open when the indoor temperature is within this margin and the CO₂ threshold is reached."
                    >
                      <input
                          class="form-input max-w-md"
                          type="number"
                          min="0.1"
                          max="10"
                          step="0.1"
                          value={form().temperatureMargin}
                          onInput={(event) => update(
                              "temperatureMargin",
                              event.currentTarget.valueAsNumber
                          )}/>
                    </Field>
                  </div>
                </Match>
                <Match when={current().id === "co2Control"}>
                  <div class="space-y-4">
                    <div>
                      <p class="mb-2 text-sm font-semibold">CO₂ setpoint</p>
                      <ChoiceGrid
                          items={co2ControlOptions}
                          value={String(form().co2SetpointPpm ?? 800)}
                          onChange={(value) => update(
                              "co2SetpointPpm",
                              Number(value) as 500 | 600 | 700 | 800 | 900 | 1000
                          )}
                          icon={<Gauge size={20}/>}/>
                      <p class="mt-3 max-w-3xl text-xs leading-relaxed text-graphite/55">
                        EnergyPlus will modulate mechanical outdoor air to follow
                        this indoor CO₂ setpoint. This is independent of automatic
                        window opening and can be combined with the green wall.
                      </p>
                    </div>
                  </div>
                </Match>
                <Match when={current().id === "review"}>
                  <Review
                      payload={form()}
                      sets={setsQuery.data ?? []}
                      plants={plantsQuery.data ?? []}/>
                </Match>
              </Switch>
            </div>

            <footer class="flex shrink-0 items-center justify-end border-t border-warm-stone/20 px-5 py-4 sm:px-8">
              <Show
                  when={current().id !== "review"}
                  fallback={<button
                      type="button"
                      onClick={() => startAction.mutate(form())}
                      disabled={startAction.isPending}
                      class="flex items-center gap-2 rounded-xl bg-citadel-blue px-5 py-3 font-semibold text-cloud-white shadow-lg shadow-citadel-blue/20 disabled:opacity-50"
                  >
                    {startAction.isPending ? (
                        <LoaderCircle class="animate-spin" size={18}/>
                    ) : (
                        <Play size={18}/>
                    )}
                    Start simulation
                  </button>}
              >
                <button
                    type="button"
                    onClick={next}
                    disabled={!valid()}
                    class="flex items-center gap-2 rounded-xl bg-citadel-blue px-5 py-3 font-semibold text-cloud-white disabled:opacity-40"
                >
                  Next <ArrowRight size={18}/>
                </button>
              </Show>
            </footer>
          </div>
        </section>

      </>
  );
}

function ToggleCard(props: {
  icon: unknown;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={props.checked}
      onClick={() => props.onChange(!props.checked)}
      class={`flex min-h-36 items-start gap-4 rounded-2xl border p-5 text-left transition ${props.checked ? "border-citadel-blue bg-sky-mist/30 shadow-md" : "border-warm-stone/25 bg-white hover:border-citadel-blue/50"}`}
    >
      <span
        class={`grid size-11 shrink-0 place-items-center rounded-xl ${props.checked ? "bg-citadel-blue text-cloud-white" : "bg-sky-mist/25 text-citadel-blue"}`}
      >
        {props.icon as any}
      </span>
      <span class="min-w-0 flex-1">
        <span class="block font-bold text-graphite">{props.title}</span>
        <span class="mt-1 block text-sm leading-relaxed text-graphite/60">
          {props.description}
        </span>
      </span>
      <span
        class={`mt-1 flex h-6 w-11 shrink-0 rounded-full p-1 transition ${props.checked ? "justify-end bg-citadel-blue" : "justify-start bg-warm-stone/30"}`}
      >
        <span class="size-4 rounded-full bg-white" />
      </span>
    </button>
  );
}

type Choice = { value: string; label: string; description: string };
function ChoiceGrid(props: {
  items: Choice[];
  value: string;
  onChange: (value: string) => void;
  icon: unknown;
}) {
  return (
    <div class="grid gap-3 md:grid-cols-2">
      <For each={props.items}>
        {(item) => (
          <button
            type="button"
            onClick={() => props.onChange(item.value)}
            class={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${props.value === item.value ? "border-citadel-blue bg-sky-mist/30 ring-2 ring-citadel-blue/10" : "border-warm-stone/25 bg-white hover:border-citadel-blue/50"}`}
          >
            <span
              class={`grid size-10 shrink-0 place-items-center rounded-xl ${props.value === item.value ? "bg-citadel-blue text-cloud-white" : "bg-sky-mist/20 text-citadel-blue"}`}
            >
              {props.icon as any}
            </span>
            <span class="min-w-0">
              <span class="block break-words font-bold text-graphite">
                {item.label}
              </span>
              <span class="mt-0.5 block text-sm text-graphite/55">
                {item.description}
              </span>
            </span>
          </button>
        )}
      </For>
    </div>
  );
}

function QueryChoices(props: {
  loading: boolean;
  error: boolean;
  empty: string;
  children: JSX.Element;
}) {
  return (
    <Show
      when={!props.loading}
      fallback={
        <div class="flex items-center gap-2 text-graphite/60">
          <LoaderCircle class="animate-spin" size={18} />
          Loading…
        </div>
      }
    >
      <Show
        when={!props.error}
        fallback={<p class="text-error">Could not load data from Spring.</p>}
      >
        {props.children}
      </Show>
    </Show>
  );
}
function Field(props: { label: string; hint?: string; children: JSX.Element }) {
  return (
    <label class="block">
      <span class="mb-2 block text-sm font-semibold text-graphite">
        {props.label}
      </span>
      {props.children}
      <Show when={props.hint}>
        <span class="mt-2 block text-xs text-graphite/55">{props.hint}</span>
      </Show>
    </label>
  );
}
function Review(props: {
  payload: NewSimulationPayload;
  sets: { id: string; name: string; displayName?: string }[];
  plants: { id: string; name: string }[];
}) {
  return <LegacyReview {...props} />;
}

export function LegacyReview(props: {
  payload: NewSimulationPayload;
  sets: { id: string; name: string; displayName?: string }[];
  plants: { id: string; name: string }[];
}) {
  const row = (label: string, value: string) => (
    <div class="flex items-start justify-between gap-5 border-b border-warm-stone/15 py-3 last:border-0">
      <span class="text-sm text-graphite/55">{label}</span>
      <span class="text-right text-sm font-semibold text-graphite">
        {value}
      </span>
    </div>
  );
  return (
    <div class="mx-auto max-w-2xl rounded-2xl border border-warm-stone/25 bg-white px-5 py-2">
      {row("Simulation name", props.payload.name?.trim() || "Simulation")}
      {row(
        "Location",
        locations.find((item) => item.value === props.payload.location)
          ?.label ?? props.payload.location,
      )}
      {row(
        "Construction set",
        (() => {
          const selected = props.sets.find(item => item.id === props.payload.constructionSet || item.name === props.payload.constructionSet);
          return selected?.displayName ?? selected?.name ?? props.payload.constructionSet;
        })(),
      )}
      {row(
        "Green wall",
        props.payload.plantsEnabled
          ? `${props.plants.find((item) => item.id === props.payload.plantId)?.name ?? ""} · ${(props.payload.greenWallSize ?? "MEDIUM").replace("_", " ")} green wall · ${props.payload.lightingLevel ?? "MEDIUM"} light`
          : "Disabled",
      )}
      {row(
        "Plant CO₂ exchange",
        props.payload.plantsEnabled
          ? props.payload.exchangeMode === "UPTAKE_ONLY"
            ? "Uptake-only scenario"
            : "Full CO₂ exchange"
          : "Disabled",
      )}
      {row(
        "Open windows",
        props.payload.openWindowsEnabled
          ? `${props.payload.minCo2Level} ppm · ±${props.payload.temperatureMargin} °C`
          : "Disabled",
      )}
      {row(
        "CO₂ control",
        props.payload.co2ControlEnabled
          ? `${props.payload.co2SetpointPpm ?? 800} ppm · native mechanical ventilation DCV`
          : "Disabled",
      )}
    </div>
  );
}
