import { createFileRoute } from "@tanstack/solid-router";
import ConstructionSetManager from "../../../../../features/construction-sets/ConstructionSetManager";

export const Route = createFileRoute(
  "/(app)/_authenticated/create-building-dt/constructions/construction-sets",
)({
  staticData: {
    workspaceHeader: {
      eyebrow: "Constructions",
      title: "Construction Sets",
      backTo: "/create-building-dt/constructions",
    },
  },
  component: Page,
});

function Page() {
  return (
    <div class="h-full min-h-0">
      <ConstructionSetManager />
    </div>
  );
}
