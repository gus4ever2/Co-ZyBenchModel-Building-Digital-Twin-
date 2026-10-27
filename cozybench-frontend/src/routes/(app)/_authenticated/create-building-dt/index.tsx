import { createFileRoute } from "@tanstack/solid-router";
import { HardHat, Ruler } from "lucide-solid";
import WorkspaceNavigationCard from "../../../../components/building-dt/WorkspaceNavigationCard";

export const Route = createFileRoute(
  "/(app)/_authenticated/create-building-dt/",
)({
  component: Page,
});

function Page() {
  return (
    <section class="mx-auto max-w-6xl">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <WorkspaceNavigationCard
          to="/create-building-dt/constructions"
          title="Constructions"
          description="Manage construction assemblies and their material layers."
          icon={HardHat}
        />
        <WorkspaceNavigationCard
          to="/create-building-dt/floorplan"
          title="Floorplan"
          description="Draw the building geometry, zones, walls, and openings."
          icon={Ruler}
        />
      </div>
    </section>
  );
}
