import { Outlet, createFileRoute } from "@tanstack/solid-router";

export const Route = createFileRoute(
  "/(app)/_authenticated/create-building-dt/constructions",
)({
  staticData: {
    workspaceHeader: {
      eyebrow: "Building Digital Twin",
      title: "Constructions",
      backTo: "/create-building-dt",
    },
  },
  component: () => <Outlet />,
});
