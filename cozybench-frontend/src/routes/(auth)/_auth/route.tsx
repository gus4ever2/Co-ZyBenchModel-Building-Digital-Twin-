import { Outlet, createFileRoute, redirect } from "@tanstack/solid-router";

export const Route = createFileRoute("/(auth)/_auth")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => <Outlet />,
});
