import { createFileRoute } from "@tanstack/solid-router";
import PlantLibraryPage from "../../../../features/plant-dt/PlantLibraryPage";

export const Route = createFileRoute(
  "/(app)/_authenticated/create-plant-dt/library",
)({
  component: PlantLibraryPage,
});
