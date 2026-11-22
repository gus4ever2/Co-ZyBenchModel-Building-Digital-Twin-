import { createFileRoute, redirect } from "@tanstack/solid-router";

export const Route = createFileRoute("/(auth)/_auth/sign-up")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});
