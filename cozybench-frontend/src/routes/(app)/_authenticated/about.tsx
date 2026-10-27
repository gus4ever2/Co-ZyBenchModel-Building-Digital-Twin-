import { createFileRoute } from "@tanstack/solid-router";
import AboutPage from "../../../features/about/AboutPage";

export const Route = createFileRoute("/(app)/_authenticated/about")({
  component: AboutPage,
});
