import { createFileRoute } from "@tanstack/solid-router";
import SimulationsPage from "../../features/simulations/SimulationsPage";

export const Route = createFileRoute("/guest/simulations")({
  component: SimulationsPage,
});
