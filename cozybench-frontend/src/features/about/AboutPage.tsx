import { Award, BookOpen, Cpu, Globe2, Mail, Thermometer, Users } from "lucide-solid";
import { onMount, useContext } from "solid-js";
import { InfoModalContext } from "../../context/InfoModalContext";
import CozyBenchGuide from "./CozyBenchGuide";
import WorkspaceHeader from "../../components/layout/WorkspaceHeader";
import WorkspaceIntroPanel from "../../components/layout/WorkspaceIntroPanel";

const features = [
  { label: "Advanced thermal comfort simulation", icon: Thermometer },
  { label: "Energy efficiency optimization", icon: Award },
  { label: "Occupant comfort analysis", icon: Users },
  { label: "Climate-aware simulation workflows", icon: Globe2 },
];

export default function AboutPage() {
  const infoModal = useContext(InfoModalContext);
  const openGuide = () => {
    if (!infoModal) return;
    infoModal.setInfoModalContent(() => CozyBenchGuide);
    infoModal.setInfoModalOpen(true);
  };

  onMount(openGuide);

  return (
    <section class="mx-auto flex h-[calc(100vh-10rem)] min-h-0 w-full max-w-6xl flex-col gap-4 lg:h-[calc(100vh-4rem)]">
      <WorkspaceHeader eyebrow="CozyBench" title="About the platform" />

      <main class="cozy-scrollbar min-h-0 flex-1 overflow-y-auto rounded-3xl border border-cloud-white/60 bg-cloud-white/95 p-5 shadow-2xl shadow-black/15 sm:p-6">
        <WorkspaceIntroPanel
          class="mb-6"
          eyebrow="Building performance case study"
          title="About CozyBench"
          description="CozyBench supports the creation, execution and evaluation of building energy simulations, bringing digital-twin configuration and simulation results into one consistent workspace."
          info={{ onOpen: openGuide }}
        />

        <section class="mb-6 flex flex-col gap-4 rounded-2xl border border-citadel-blue/20 bg-graphite p-5 text-cloud-white shadow-lg shadow-black/10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.18em] text-sky-mist">
              New to CozyBench
            </p>
            <h2 class="mt-1 text-xl font-bold">Read the full platform guide</h2>
            <p class="mt-1 max-w-2xl text-sm leading-6 text-cloud-white/70">
              Learn how GreenWall, CO₂, DCV, construction sets and simulation comparison work together.
            </p>
          </div>
          <button
            type="button"
            class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cloud-white px-4 py-2.5 text-sm font-bold text-graphite transition hover:bg-sky-mist focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-mist"
            onClick={openGuide}
          >
            <BookOpen class="size-4" /> Open guide
          </button>
        </section>

        <div class="grid gap-4 md:grid-cols-2">
          <article class="rounded-2xl border border-warm-stone/20 bg-cloud-white p-5 shadow-sm">
            <div class="mb-4 flex size-10 items-center justify-center rounded-xl bg-graphite text-cloud-white">
              <Thermometer class="size-5" />
            </div>
            <h3 class="text-lg font-bold text-graphite">Our mission</h3>
            <p class="mt-2 text-sm leading-6 text-graphite/60">
              CozyBench is dedicated to improving thermal comfort in buildings
              while reducing energy consumption. The platform enables engineers
              and researchers to configure and benchmark building systems under
              different operating and climate conditions.
            </p>
          </article>

          <article class="rounded-2xl border border-warm-stone/20 bg-cloud-white p-5 shadow-sm">
            <div class="mb-4 flex size-10 items-center justify-center rounded-xl bg-citadel-blue text-cloud-white">
              <Cpu class="size-5" />
            </div>
            <h3 class="text-lg font-bold text-graphite">Technology</h3>
            <p class="mt-2 text-sm leading-6 text-graphite/60">
              The platform combines building digital twins, EnergyPlus-based
              simulation and configurable control strategies to study energy
              use, indoor conditions and occupant-oriented scenarios.
            </p>
          </article>

          <article class="rounded-2xl border border-warm-stone/20 bg-cloud-white p-5 shadow-sm">
            <h3 class="text-lg font-bold text-graphite">Key features</h3>
            <ul class="mt-4 space-y-3">
              {features.map((feature) => (
                <li class="flex items-center gap-3 text-sm text-graphite/65">
                  <span class="grid size-8 shrink-0 place-items-center rounded-lg bg-sky-mist/25 text-citadel-blue">
                    <feature.icon class="size-4" />
                  </span>
                  {feature.label}
                </li>
              ))}
            </ul>
          </article>

          <article class="flex flex-col rounded-2xl border border-warm-stone/20 bg-graphite p-5 text-cloud-white shadow-sm">
            <div class="mb-4 flex size-10 items-center justify-center rounded-xl bg-cloud-white/10 text-sky-mist">
              <Mail class="size-5" />
            </div>
            <h3 class="text-lg font-bold">Contact us</h3>
            <p class="mt-2 flex-1 text-sm leading-6 text-cloud-white/65">
              Have a question about CozyBench, its simulations or the underlying
              case study? Get in touch with the project team.
            </p>
            <a
              href="mailto:contact@cozybench.org"
              class="mt-5 inline-flex w-fit items-center gap-2 rounded-xl bg-cloud-white px-4 py-2.5 text-sm font-bold text-graphite hover:bg-sky-mist"
            >
              <Mail class="size-4" /> Get in touch
            </a>
          </article>
        </div>
      </main>
    </section>
  );
}
