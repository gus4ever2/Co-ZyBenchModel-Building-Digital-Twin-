export default function ReferenceScenarioInfo() {
  return (
    <div class="space-y-4">
      <h3 class="text-sm font-bold text-graphite">Reference office building</h3>
      <p class="text-sm leading-relaxed text-graphite/60">
        The reference scenario uses this EnergyPlus office-building layout as a
        common baseline for comparing energy consumption and indoor environmental
        conditions. Choose a weather location and construction set, then evaluate
        green walls, automatic windows and CO₂-based ventilation.
      </p>
      <figure class="rounded-xl border border-warm-stone/20 bg-white p-3">
        <img src="/reference-office.webp"
          alt="Reference office layout used in the simulation, illustrating occupants with different thermal preferences."
          class="h-auto w-full" loading="lazy" />
        <figcaption class="mt-3 text-xs leading-relaxed text-graphite/55">
          Office layout used in the reference simulation.
        </figcaption>
      </figure>
      <p class="text-sm leading-relaxed text-graphite/60">
        Co-zyBench combines building and HVAC digital twins with occupant models
        to study energy use, thermal comfort and fairness. The layout illustrates
        occupants with different thermal preferences.
      </p>
      <a href="https://gbouloukakis.com/project/cozybench/" target="_blank"
        rel="noopener noreferrer" class="text-xs text-citadel-blue underline underline-offset-4">
        About the original Co-zyBench benchmark
      </a>
    </div>
  );
}
