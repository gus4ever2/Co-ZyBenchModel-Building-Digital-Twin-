import { createFileRoute } from "@tanstack/solid-router";
import AboutPage from "../../features/about/AboutPage";

export const Route = createFileRoute("/guest/about")({
  component: AboutPage,
});
