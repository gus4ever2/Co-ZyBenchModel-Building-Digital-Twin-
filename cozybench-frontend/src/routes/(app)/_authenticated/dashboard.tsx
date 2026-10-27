import { createFileRoute } from "@tanstack/solid-router";
import DashboardPage from "../../../features/dashboard/DashboardPage";

export const Route = createFileRoute("/(app)/_authenticated/dashboard")({
  component: DashboardPage,
});
