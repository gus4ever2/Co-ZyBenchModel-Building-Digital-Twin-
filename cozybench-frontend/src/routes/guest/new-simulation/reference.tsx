import { createFileRoute } from "@tanstack/solid-router";
import NewSimulationWizard from "../../../features/new-simulation/NewSimulationWizard";

export const Route = createFileRoute("/guest/new-simulation/reference")({
  component: GuestReferenceScenarioPage,
});

function GuestReferenceScenarioPage() {
  return <NewSimulationWizard guestMode />;
}
