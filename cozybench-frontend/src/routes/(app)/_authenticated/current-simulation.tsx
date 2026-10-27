import { createFileRoute } from "@tanstack/solid-router";
import CurrentSimulationPage from "../../../features/simulations/CurrentSimulationPage";

export const Route = createFileRoute(
  "/(app)/_authenticated/current-simulation",
)({ component: Page });

function Page() {
  return <CurrentSimulationPage />;
}
