import {
  Building2,
  ChartLine,
  ChartNoAxesCombined,
  Cpu,
  Leaf,
  Thermometer,
  Users,
} from "lucide-solid";

const guideSections = [
  {
    title: "1. Start a simulation",
    icon: ChartLine,
    description:
      "Open New Simulation and choose either the CozyBench reference scenario or a customised scenario. Select the location, construction set and the operating options you want to evaluate, then run the simulation.",
  },
  {
    title: "2. Configure the building components",
    icon: Building2,
    description:
      "Create Building DT is the construction-library workspace, not a full building modeller. Use it to manage materials, combine them into constructions, and assign those constructions in reusable construction sets for a simulation.",
  },
  {
    title: "3. Add a GreenWall",
    icon: Leaf,
    description:
      "Create or select a plant model, then enable the green wall in a simulation. Choose its coverage, lighting level and CO₂ exchange behaviour to examine how the planted wall affects the indoor scenario.",
  },
  {
    title: "4. Study CO₂ and DCV",
    icon: Cpu,
    description:
      "Use the CO₂ options to define the indoor-air conditions you want to study. When DCV is enabled, CozyBench models demand-controlled mechanical ventilation using the selected CO₂ setpoint, so you can examine ventilation, indoor CO₂ and energy together.",
  },
  {
    title: "5. Compare simulations",
    icon: ChartNoAxesCombined,
    description:
      "Compare selects one saved simulation as the baseline and places other saved runs beside it. Use it to see how changes in the construction set, green wall, CO₂/DCV settings or operating scenario affect HVAC electricity, indoor CO₂, temperature, humidity and related results.",
  },
  {
    title: "6. Review and keep the evidence",
    icon: Thermometer,
    description:
      "Use Current Simulation for the active run and History for saved runs. The results views bring together the configuration, time-series charts, summaries and comparison tables, making it easier to explain what changed and why.",
  },
];

export default function CozyBenchGuide() {
  return (
    <div class="space-y-6 text-sm leading-6 text-graphite/70">
      <header class="rounded-2xl border border-citadel-blue/15 bg-sky-mist/15 p-5">
        <p class="text-xs font-bold uppercase tracking-[0.18em] text-citadel-blue">
          Platform guide
        </p>
        <h2 class="mt-2 text-2xl font-bold text-graphite">
          What CozyBench can do
        </h2>
        <p class="mt-3 max-w-2xl">
          CozyBench is a simulation workspace for testing building-envelope
          choices, indoor environmental conditions, green walls and ventilation
          strategies in one consistent workflow.
        </p>
      </header>

      <section class="rounded-2xl border border-warm-stone/20 bg-cloud-white p-5">
        <div class="flex items-start gap-3">
          <span class="grid size-9 shrink-0 place-items-center rounded-xl bg-citadel-blue text-cloud-white">
            <Users class="size-4" />
          </span>
          <div>
            <h3 class="font-bold text-graphite">A simple way to work</h3>
            <p class="mt-1">
              Prepare the construction set and simulation choices, run a case,
              then compare its results with a baseline. Change one meaningful
              input at a time when you want to understand its effect.
            </p>
          </div>
        </div>
      </section>

      <div class="space-y-3">
        {guideSections.map((section) => (
          <section class="rounded-2xl border border-warm-stone/20 bg-cloud-white p-5 shadow-sm">
            <div class="flex gap-3">
              <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-mist/25 text-citadel-blue">
                <section.icon class="size-5" />
              </span>
              <div>
                <h3 class="font-bold text-graphite">{section.title}</h3>
                <p class="mt-1.5">{section.description}</p>
              </div>
            </div>
          </section>
        ))}
      </div>

      <p class="rounded-xl border border-warm-stone/20 bg-warm-stone/10 px-4 py-3 text-xs leading-5 text-graphite/60">
        Tip: a comparison is most useful when the baseline and the compared run
        differ in one or a small number of settings. That makes the resulting
        differences easier to interpret.
      </p>
    </div>
  );
}
