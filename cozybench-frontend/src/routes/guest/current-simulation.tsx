import { createFileRoute } from "@tanstack/solid-router";
import CurrentSimulationPage from "../../features/simulations/CurrentSimulationPage";

export const Route = createFileRoute("/guest/current-simulation")({
  component: () => <CurrentSimulationPage guestMode />,
});
