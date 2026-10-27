import { createFileRoute } from "@tanstack/solid-router";
import NewSimulationWizard from "../../../../features/new-simulation/NewSimulationWizard";

export const Route = createFileRoute(
  "/(app)/_authenticated/new-simulation/reference",
)({
  component: NewSimulationWizard,
});
