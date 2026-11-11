import { createFileRoute } from "@tanstack/solid-router";
import ScenarioSelectionPage from "../../../features/new-simulation/ScenarioSelectionPage";

export const Route = createFileRoute("/guest/new-simulation/")({
  component: GuestScenarioSelectionPage,
});

function GuestScenarioSelectionPage() {
  return <ScenarioSelectionPage guestMode />;
}
