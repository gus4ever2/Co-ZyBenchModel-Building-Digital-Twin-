import { createFileRoute, redirect } from "@tanstack/solid-router";

export const Route = createFileRoute("/guest/")({
  beforeLoad: () => {
    throw redirect({ to: "/guest/new-simulation" });
  },
});
