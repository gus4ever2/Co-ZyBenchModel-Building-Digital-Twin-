import { Outlet, createFileRoute } from "@tanstack/solid-router";

export const Route = createFileRoute("/(app)/_authenticated/new-simulation")({
  component: Outlet,
});
