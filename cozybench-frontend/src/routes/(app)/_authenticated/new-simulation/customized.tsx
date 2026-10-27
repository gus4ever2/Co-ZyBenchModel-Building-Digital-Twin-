import { createFileRoute } from "@tanstack/solid-router";
import CustomizedScenarioPage from "../../../../features/new-simulation/CustomizedScenarioPage";

export const Route = createFileRoute(
  "/(app)/_authenticated/new-simulation/customized",
)({
  component: CustomizedScenarioPage,
});
