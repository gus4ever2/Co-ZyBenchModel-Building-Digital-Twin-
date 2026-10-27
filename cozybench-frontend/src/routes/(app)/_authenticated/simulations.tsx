import { createFileRoute } from "@tanstack/solid-router";
import SimulationsPage from "../../../features/simulations/SimulationsPage";

export const Route = createFileRoute("/(app)/_authenticated/simulations")({
  component: SimulationsPage,
});
