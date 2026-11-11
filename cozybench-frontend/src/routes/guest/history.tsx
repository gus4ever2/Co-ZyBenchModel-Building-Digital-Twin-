import { createFileRoute } from "@tanstack/solid-router";
import HistoryPage from "../../features/history/HistoryPage";

export const Route = createFileRoute("/guest/history")({
  component: HistoryPage,
});
