import { createFileRoute, redirect } from "@tanstack/solid-router";

export const Route = createFileRoute("/(auth)/_auth/sign-in")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});
