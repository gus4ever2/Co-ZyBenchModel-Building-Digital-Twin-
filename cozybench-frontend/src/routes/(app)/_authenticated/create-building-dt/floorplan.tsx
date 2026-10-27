import { createFileRoute } from "@tanstack/solid-router";
import FloorplanEditor from "../../../../features/floorplan/FloorplanEditor";

export const Route = createFileRoute(
  "/(app)/_authenticated/create-building-dt/floorplan",
)({
  staticData: {
    workspaceHeader: {
      eyebrow: "Building geometry",
      title: "Floorplan Editor",
      backTo: "/create-building-dt",
    },
  },
  component: FloorplanEditor,
});
