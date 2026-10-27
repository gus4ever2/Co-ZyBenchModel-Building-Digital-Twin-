import { Outlet, createFileRoute, useMatches } from "@tanstack/solid-router";
import { Show } from "solid-js";
import WorkspaceHeader from "../../../../components/layout/WorkspaceHeader";

export const Route = createFileRoute(
  "/(app)/_authenticated/create-building-dt",
)({
  staticData: {
    workspaceHeader: {
      eyebrow: "Digital twin workspace",
      title: "Create Building Digital Twin",
    },
  },
  component: Layout,
});

function Layout() {
  const header = useMatches({
    select: (matches) => {
      for (let index = matches.length - 1; index >= 0; index -= 1) {
        const workspaceHeader = matches[index].staticData.workspaceHeader;

        if (workspaceHeader) {
          return workspaceHeader;
        }
      }

      return undefined;
    },
  });

  return (
    <div class="mx-auto flex h-full min-h-0 w-full max-w-[94rem] flex-col gap-4">
      <Show when={header()}>
        {(workspaceHeader) => (
          <WorkspaceHeader
            eyebrow={workspaceHeader().eyebrow}
            title={workspaceHeader().title}
            backTo={workspaceHeader().backTo}
          />
        )}
      </Show>

      <div class="min-h-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
