import { createFileRoute } from "@tanstack/solid-router";
import ScenarioSelectionPage from "../../../../features/new-simulation/ScenarioSelectionPage";

export const Route = createFileRoute("/(app)/_authenticated/new-simulation/")({
  component: ScenarioSelectionPage,
});
