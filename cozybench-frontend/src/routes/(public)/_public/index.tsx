import { createFileRoute } from "@tanstack/solid-router";
import HeroSection from "../../../components/home/HeroSection";

export const Route = createFileRoute("/(public)/_public/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div
        class="min-h-screen inset-0 p-8 bg-[url(/citadel.webp)]"
        aria-hidden="true"
      >
        <HeroSection />
      </div>
    </>
  );
}
