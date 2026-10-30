import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  ChartLine,
  ChartNoAxesCombined,
  Clock3,
  Leaf,
  Wind,
} from "lucide-solid";
import { For, Show, createMemo, createSignal } from "solid-js";
import { Dynamic } from "solid-js/web";

type GuideSection = {
  heading: string;
  body: string;
  bullets?: string[];
};

type GuidePage = {
  label: string;
  icon: typeof BookOpen;
  eyebrow: string;
  title: string;
  intro: string;
  sections: GuideSection[];
};

const pages: GuidePage[] = [
  {
    label: "Welcome",
    icon: BookOpen,
    eyebrow: "CozyBench guide · 1 of 7",
    title: "What CozyBench is for",
    intro: "CozyBench is a workspace for creating, running, reviewing and comparing building-energy simulation cases. It keeps the simulation setup and its evidence together, so you can explain what changed, why it changed, and what the result means.",
    sections: [
      {
        heading: "The basic workflow",
        body: "Start with a construction set and a simulation scenario. Choose the operating controls you want to study, run the case, then use History or Compare Simulations to inspect the outputs.",
        bullets: [
          "Create a clear baseline before testing a change.",
          "Change one or a small number of inputs per follow-up case.",
          "Use the saved setup alongside the results when interpreting a graph.",
        ],
      },
      {
        heading: "What the results represent",
        body: "CozyBench brings EnergyPlus-based energy and indoor-condition outputs into one interface. Values are reported by timestep and, where useful, as summaries for the whole building or a selected thermal zone.",
      },
    ],
  },
  {
    label: "Building components",
    icon: Building2,
    eyebrow: "CozyBench guide · 2 of 7",
    title: "Prepare construction components and sets",
    intro: "Create Building DT is the construction-library area of CozyBench. It is used to prepare reusable materials, constructions and construction sets for simulations.",
    sections: [
      {
        heading: "What Building DT includes",
        body: "Create or review materials, combine layers into constructions, then group those constructions in a construction set. The construction set is the configuration saved with a simulation and can be reviewed later in History or Compare Simulations.",
        bullets: [
          "Materials describe individual physical layers.",
          "Constructions combine layers into assemblies such as walls, roofs or glazing.",
          "Construction sets collect the assemblies used by a simulation.",
        ],
      },
      {
        heading: "Important scope",
        body: "Building DT is not a whole-building digital-twin modeller. It focuses on construction components and construction-set assignment. The building geometry used by the case remains part of the simulation model.",
      },
    ],
  },
  {
    label: "Run a case",
    icon: ChartLine,
    eyebrow: "CozyBench guide · 3 of 7",
    title: "Create and run a simulation",
    intro: "Use New Simulation to start from the CozyBench reference scenario or create a customised scenario. The simulation setup is saved with the result so the case remains traceable after it completes.",
    sections: [
      {
        heading: "Choose the case inputs",
        body: "Select the location and construction set, then set the heating and cooling setpoints and activate only the operating strategies you want to study. The setup summary shown with the result is the best first check before reading a graph.",
        bullets: [
          "Reference scenarios provide a consistent starting point.",
          "Customised scenarios let you change the available simulation options.",
          "A completed run preserves the city, construction set and enabled controls used for that case.",
        ],
      },
      {
        heading: "Use meaningful cases",
        body: "For an understandable comparison, keep weather, schedule and geometry consistent unless one of those is intentionally being studied. Name each simulation so its purpose is obvious in History and comparison tables.",
      },
    ],
  },
  {
    label: "GreenWall",
    icon: Leaf,
    eyebrow: "CozyBench guide · 4 of 7",
    title: "Add and analyse a GreenWall",
    intro: "CozyBench can include a plant model as a green wall in a simulation. GreenWall analysis connects the selected plant configuration with seasonal HVAC energy and zone-level plant information.",
    sections: [
      {
        heading: "Configure the plant",
        body: "Create or select a plant model, then choose the green-wall size, lighting level and CO₂ exchange mode for the simulation. These choices are stored with the simulation, rather than being inferred later from the results.",
        bullets: [
          "The eye action opens the selected plant model and physiology details.",
          "Leaf area and green-wall area appear only for zones that contain a plant result.",
          "GreenWall analysis shows seasonal HVAC electricity alongside plant parameters.",
        ],
      },
      {
        heading: "Read GreenWall results carefully",
        body: "Use a baseline without the GreenWall, or with a deliberately different plant setup, when you want to understand its effect. Review energy, indoor CO₂ and the zone-specific plant information together rather than relying on a single value.",
      },
    ],
  },
  {
    label: "Air controls",
    icon: Wind,
    eyebrow: "CozyBench guide · 5 of 7",
    title: "Study CO₂, DCV and window opening",
    intro: "Indoor-air controls are optional simulation settings. Each one appears in the results only when it was enabled for that simulation, keeping the analysis focused on information the case actually contains.",
    sections: [
      {
        heading: "CO₂ and demand-controlled ventilation",
        body: "DCV uses the chosen CO₂ setpoint to control mechanical ventilation. The ventilation analysis helps you relate outdoor-air control to indoor CO₂ and energy use. Compare weekday and occupied-hour summaries when reviewing different strategies.",
      },
      {
        heading: "Window-opening strategies",
        body: "Open-window simulations can use Linear, On–Off or Fixed-percentage strategies. Fixed strategies display their configured percentage. The window chart reports the mean actuator opening factor; it is not the percentage of time that a window was open.",
        bullets: [
          "Check the selected zone before reading window-opening data.",
          "Only zones with actual window-opening results are available in that analysis.",
          "Openable-window area is reported separately from the opening percentage.",
        ],
      },
    ],
  },
  {
    label: "History",
    icon: Clock3,
    eyebrow: "CozyBench guide · 6 of 7",
    title: "Review one completed simulation",
    intro: "History is the single-simulation workspace. Select a saved case to see its preserved setup, then open the analysis cards that are relevant to that case.",
    sections: [
      {
        heading: "Use the cards as an analysis map",
        body: "Energy, CO₂, temperature, humidity and Building information are available when their data exists. GreenWall, open-window and DCV cards appear only when those controls were enabled in the saved setup.",
      },
      {
        heading: "Building information",
        body: "Building information begins with whole-building area, volume, window, occupant and setpoint values. Below it, select a thermal zone to review its geometry, openable-window information, any GreenWall area and leaf area, and the occupants-over-time graph.",
      },
      {
        heading: "Keep the evidence",
        body: "The JSON icon on a History card downloads the saved simulation record. The card also keeps concise setup labels so you can identify the construction set, plant, window strategy and DCV setting without opening every analysis.",
      },
    ],
  },
  {
    label: "Compare",
    icon: ChartNoAxesCombined,
    eyebrow: "CozyBench guide · 7 of 7",
    title: "Compare simulations with a baseline",
    intro: "Compare Simulations places two to six completed cases side by side. The first selected simulation is the baseline; the remaining simulations are evaluated against it where a difference is meaningful.",
    sections: [
      {
        heading: "Choose a useful baseline",
        body: "Select the reference case first, then add cases that answer a clear question: for example, a different construction set, GreenWall configuration, DCV setpoint or window-opening strategy.",
        bullets: [
          "Energy tables show absolute values and differences from the baseline.",
          "CO₂, temperature, humidity and ventilation views provide both summaries and time-series comparison.",
          "Building information remains per simulation, because geometry and zone values are not comparison deltas.",
        ],
      },
      {
        heading: "Interpret rather than just rank",
        body: "A lower energy value is not automatically the better result. Review the associated temperature, humidity, CO₂, ventilation and operating settings to understand the comfort and indoor-air-quality trade-offs behind the difference.",
      },
    ],
  },
];

function CozyBenchGuide() {
  const [activeIndex, setActiveIndex] = createSignal(0);
  const activePage = createMemo(() => pages[activeIndex()]);
  const goTo = (index: number) => setActiveIndex(Math.max(0, Math.min(index, pages.length - 1)));

  return (
    <div class="flex h-full min-h-0 flex-col text-sm leading-6 text-graphite/70">
      <header class="shrink-0 rounded-2xl border border-citadel-blue/15 bg-sky-mist/15 p-5">
        <p class="text-xs font-bold uppercase tracking-[0.18em] text-citadel-blue">Platform guide</p>
        <h2 class="mt-2 pr-8 text-2xl font-bold text-graphite">Using CozyBench</h2>
        <p class="mt-3 max-w-3xl">A practical guide to setting up a case, using GreenWall and air-control strategies, and reading single-simulation or comparison results.</p>
      </header>

      <div class="mt-5 grid min-h-0 flex-1 gap-5 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <nav class="flex shrink-0 gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible" aria-label="Guide contents">
          <For each={pages}>
            {(page, index) => (
              <button
                type="button"
                onClick={() => goTo(index())}
                aria-current={activeIndex() === index() ? "step" : undefined}
                class="flex min-w-max items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition lg:min-w-0"
                classList={{
                  "border-citadel-blue bg-citadel-blue text-cloud-white shadow-sm": activeIndex() === index(),
                  "border-warm-stone/20 bg-cloud-white text-graphite/65 hover:border-citadel-blue/45 hover:bg-sky-mist/25": activeIndex() !== index(),
                }}
              >
                <Dynamic component={page.icon} class="size-4 shrink-0" />
                <span>{page.label}</span>
              </button>
            )}
          </For>
        </nav>

        <article class="flex min-h-0 min-w-0 flex-col rounded-2xl border border-warm-stone/20 bg-cloud-white p-5 shadow-sm">
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-citadel-blue">{activePage().eyebrow}</p>
          <div class="mt-2 flex items-start gap-3">
            <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-mist/35 text-citadel-blue">
              <Dynamic component={activePage().icon} class="size-5" />
            </span>
            <div>
              <h3 class="text-xl font-bold text-graphite">{activePage().title}</h3>
              <p class="mt-2">{activePage().intro}</p>
            </div>
          </div>

          <div class="cozy-scrollbar mt-5 min-h-0 flex-1 space-y-5 overflow-y-auto pr-3">
            <For each={activePage().sections}>
              {(section) => (
                <section>
                  <h4 class="font-bold text-graphite">{section.heading}</h4>
                  <p class="mt-1.5">{section.body}</p>
                  <Show when={section.bullets?.length}>
                    <ul class="mt-2 space-y-1.5 pl-5 text-graphite/65">
                      <For each={section.bullets}>{(bullet) => <li class="list-disc pl-1">{bullet}</li>}</For>
                    </ul>
                  </Show>
                </section>
              )}
            </For>
          </div>

          <footer class="mt-5 flex shrink-0 items-center justify-between gap-3 border-t border-warm-stone/15 pt-4">
            <button type="button" disabled={activeIndex() === 0} onClick={() => goTo(activeIndex() - 1)} class="inline-flex items-center gap-2 rounded-xl border border-warm-stone/20 px-3 py-2 text-xs font-bold text-graphite transition hover:border-citadel-blue/45 hover:bg-sky-mist/25 disabled:cursor-not-allowed disabled:opacity-40">
              <ArrowLeft class="size-4" /> Previous
            </button>
            <span class="text-xs font-semibold text-graphite/50">{activeIndex() + 1} / {pages.length}</span>
            <button type="button" disabled={activeIndex() === pages.length - 1} onClick={() => goTo(activeIndex() + 1)} class="inline-flex items-center gap-2 rounded-xl bg-citadel-blue px-3 py-2 text-xs font-bold text-cloud-white transition hover:bg-citadel-blue/90 disabled:cursor-not-allowed disabled:opacity-40">
              Next <ArrowRight class="size-4" />
            </button>
          </footer>
        </article>
      </div>
    </div>
  );
}

Object.assign(CozyBenchGuide, { infoModalSize: "expanded" as const });

export default CozyBenchGuide;
