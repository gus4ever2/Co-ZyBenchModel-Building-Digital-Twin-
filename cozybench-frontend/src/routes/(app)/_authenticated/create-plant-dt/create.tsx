import { createFileRoute } from "@tanstack/solid-router";
import CreatePlantDtPage from "../../../../features/plant-dt/CreatePlantDtPage";

export const Route = createFileRoute(
  "/(app)/_authenticated/create-plant-dt/create",
)({
  component: CreatePlantDtPage,
});
