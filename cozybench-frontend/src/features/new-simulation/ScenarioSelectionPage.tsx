import { Link } from "@tanstack/solid-router";
import { Building2 } from "lucide-solid";
import { onMount, useContext } from "solid-js";
import WorkspaceHeader from "../../components/layout/WorkspaceHeader";
import WorkspaceIntroPanel from "../../components/layout/WorkspaceIntroPanel";
import { InfoModalContext } from "../../context/InfoModalContext";
import ReferenceScenarioInfo from "./info/ReferenceScenarioInfo";

const referenceScenario = {
  to: "/new-simulation/reference" as const,
  guestTo: "/guest/new-simulation/reference" as const,
  title: "Reference scenario",
  description: "Configure and run the CozyBench reference experiment.",
  icon: Building2,
};

export default function ScenarioSelectionPage(props: { guestMode?: boolean }) {
  const infoModal = useContext(InfoModalContext);
  const openInfo = () => {
    if (!infoModal) return;
    infoModal.setInfoModalContent(() => ScenarioHelp);
    infoModal.setInfoModalOpen(true);
  };

  onMount(openInfo);

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
          <div class="relative">
            <Link
              to={props.guestMode ? referenceScenario.guestTo : referenceScenario.to}
              class="group flex min-h-40 h-full items-start gap-4 rounded-2xl border border-warm-stone/25 bg-cloud-white p-5 text-left shadow-sm hover:border-citadel-blue/50 hover:bg-sky-mist/12 hover:shadow-md"
            >
              <span class="grid size-12 shrink-0 place-items-center rounded-xl bg-sky-mist/25 text-citadel-blue group-hover:bg-citadel-blue group-hover:text-cloud-white">
                <referenceScenario.icon class="size-5" />
              </span>
              <span>
                <span class="block text-lg font-bold text-graphite">{referenceScenario.title}</span>
                <span class="mt-2 block text-sm leading-6 text-graphite/55">{referenceScenario.description}</span>
              </span>
            </Link>
          </div>
        </div>
      </main>
    </section>
  );
}

function ScenarioHelp() {
  return (
    <div class="space-y-6">
      <ReferenceScenarioInfo />
    </div>
  );
}
