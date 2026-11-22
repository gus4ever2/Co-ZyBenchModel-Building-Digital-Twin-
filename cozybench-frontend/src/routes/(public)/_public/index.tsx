import { createFileRoute } from "@tanstack/solid-router";
import HeroSection from "../../../components/home/HeroSection";

export const Route = createFileRoute("/(public)/_public/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div
        class="relative min-h-screen w-full overflow-hidden bg-[#203946] bg-[url('/citadel.webp')] bg-cover bg-center bg-no-repeat p-4 sm:p-6 lg:p-8"
        aria-hidden="true"
      >
        <HeroSection />
      </div>
    </>
  );
}
