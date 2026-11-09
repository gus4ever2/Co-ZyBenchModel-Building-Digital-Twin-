import { Outlet, createFileRoute } from "@tanstack/solid-router";

export const Route = createFileRoute("/guest/new-simulation")({
  component: Outlet,
});
