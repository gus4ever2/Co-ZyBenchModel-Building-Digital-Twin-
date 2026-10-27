import { createFileRoute } from "@tanstack/solid-router";
import { BrickWall, Cuboid, PanelsTopLeft } from "lucide-solid";
import WorkspaceNavigationCard from "../../../../../components/building-dt/WorkspaceNavigationCard";

export const Route = createFileRoute(
  "/(app)/_authenticated/create-building-dt/constructions/",
)({ component: Page });

function Page() {
  return (
    <section class="mx-auto max-w-6xl">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <WorkspaceNavigationCard
          to="/create-building-dt/constructions/construction-sets"
          title="Construction Sets"
          description="Assign constructions to building surfaces and openings."
          icon={PanelsTopLeft}
        />
        <WorkspaceNavigationCard
          to="/create-building-dt/constructions/construction-editor"
          title="Constructions"
          description="Build layered and specialized EnergyPlus constructions."
          icon={BrickWall}
        />
        <WorkspaceNavigationCard
          to="/create-building-dt/constructions/materials"
          title="Materials"
          description="Create, edit and reuse EnergyPlus material properties."
          icon={Cuboid}
        />
      </div>
    </section>
  );
}
