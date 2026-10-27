import { createFileRoute } from "@tanstack/solid-router";
import ConstructionManager from "../../../../../features/constructions/ConstructionManager";

export const Route = createFileRoute(
  "/(app)/_authenticated/create-building-dt/constructions/construction-editor",
)({
  staticData: {
    workspaceHeader: {
      eyebrow: "Constructions",
      title: "Construction Editor",
      backTo: "/create-building-dt/constructions",
    },
  },
  component: Page,
});

function Page() {
  return (
    <div class="h-full min-h-0">
      <ConstructionManager />
    </div>
  );
}
