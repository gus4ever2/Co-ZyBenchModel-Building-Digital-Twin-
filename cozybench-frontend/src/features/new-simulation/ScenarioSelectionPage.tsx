import { Link } from "@tanstack/solid-router";
import { Building2, SlidersHorizontal } from "lucide-solid";
import { useContext } from "solid-js";
import WorkspaceHeader from "../../components/layout/WorkspaceHeader";
import WorkspaceIntroPanel from "../../components/layout/WorkspaceIntroPanel";
import { InfoModalContext } from "../../context/InfoModalContext";
import ReferenceScenarioInfo from "./info/ReferenceScenarioInfo";
import CustomizedScenarioInfo from "./info/CustomizedScenarioInfo";

const scenarios = [
  {
    to: "/new-simulation/reference" as const,
    title: "Reference scenario",
    description: "Configure and run the CozyBench reference experiment.",
    icon: Building2,
  },
  {
    to: "/new-simulation/customized" as const,
    title: "Customized scenario",
    description: "Define your own building, occupants and HVAC configuration instead of using the reference office.",
    icon: SlidersHorizontal,
  },
];

export default function ScenarioSelectionPage() {
  const infoModal = useContext(InfoModalContext);
  const openInfo = () => {
    if (!infoModal) return;
    infoModal.setInfoModalContent(() => ScenarioHelp);
    infoModal.setInfoModalOpen(true);
  };

  return (
    <section class="mx-auto flex h-[calc(100vh-10rem)] min-h-0 w-full max-w-6xl flex-col gap-4 lg:h-[calc(100vh-4rem)]">
      <WorkspaceHeader eyebrow="Simulation workspace" title="New simulation" />
      <main class="cozy-scrollbar min-h-0 flex-1 overflow-y-auto rounded-3xl border border-cloud-white/60 bg-cloud-white p-5 shadow-2xl shadow-black/15 sm:p-8">
        <WorkspaceIntroPanel
          eyebrow="Scenario type"
          title="Choose your scenario"
          description="Select the simulation workflow you want to configure."
          info={{ onOpen: openInfo }}
        />
        <div class="mt-6 grid gap-4 md:grid-cols-2">
          {scenarios.map((scenario) => (
            <div class="relative">
              <Link
                to={scenario.to}
                class="group flex min-h-40 h-full items-start gap-4 rounded-2xl border border-warm-stone/25 bg-cloud-white p-5 text-left shadow-sm hover:border-citadel-blue/50 hover:bg-sky-mist/12 hover:shadow-md"
              >
                <span class="grid size-12 shrink-0 place-items-center rounded-xl bg-sky-mist/25 text-citadel-blue group-hover:bg-citadel-blue group-hover:text-cloud-white">
                  <scenario.icon class="size-5" />
                </span>
                <span>
                  <span class="block text-lg font-bold text-graphite">{scenario.title}</span>
                  <span class="mt-2 block text-sm leading-6 text-graphite/55">{scenario.description}</span>
                </span>
              </Link>
            </div>
          ))}
        </div>
      </main>
    </section>
  );
}

function ScenarioHelp() {
  return (
    <div class="space-y-6">
      <ReferenceScenarioInfo />
      <div class="border-t border-warm-stone/15 pt-5">
        <CustomizedScenarioInfo />
      </div>
    </div>
  );
}
