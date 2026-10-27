import { Outlet, createFileRoute } from "@tanstack/solid-router";

export const Route = createFileRoute("/(app)/_authenticated/create-plant-dt")({
  component: () => <Outlet />,
});
