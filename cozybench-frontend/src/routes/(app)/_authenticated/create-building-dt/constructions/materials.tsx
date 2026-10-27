import { createFileRoute } from "@tanstack/solid-router";
import MaterialManager from "../../../../../features/materials/MaterialManager";

export const Route = createFileRoute(
  "/(app)/_authenticated/create-building-dt/constructions/materials",
)({
  staticData: {
    workspaceHeader: {
      eyebrow: "Constructions",
      title: "Materials",
      backTo: "/create-building-dt/constructions",
    },
  },
  component: Page,
});

function Page() {
  return (
    <div class="h-full min-h-0">
      <MaterialManager />
    </div>
  );
}
