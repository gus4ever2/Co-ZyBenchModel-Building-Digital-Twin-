import { createFileRoute } from "@tanstack/solid-router";
import { Eye, Sprout } from "lucide-solid";
import WorkspaceNavigationCard from "../../../../components/building-dt/WorkspaceNavigationCard";
import WorkspaceHeader from "../../../../components/layout/WorkspaceHeader";

export const Route = createFileRoute("/(app)/_authenticated/create-plant-dt/")({
  component: PlantDtHome,
});

function PlantDtHome() {
  return (
    <section class="mx-auto max-w-6xl space-y-6">
      <WorkspaceHeader
        eyebrow="Digital twin workspace"
        title="Plant Digital Twins"
      />
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <WorkspaceNavigationCard
          to="/create-plant-dt/create"
          title="Create plant"
          description="Create a biological plant digital twin from an OBJ plant model."
          icon={Sprout}
        />
        <WorkspaceNavigationCard
          to="/create-plant-dt/library"
          title="Plant library"
          description="Browse your completed plant models and inspect them interactively in 3D."
          icon={Eye}
        />
      </div>
    </section>
  );
}
