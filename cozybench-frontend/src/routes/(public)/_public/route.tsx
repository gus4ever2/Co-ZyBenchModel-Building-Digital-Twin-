import { Outlet, createFileRoute } from "@tanstack/solid-router";
import FeatureSection from "../../../components/home/FeatureSection";
import PublicFooter from "../../../components/layout/PublicFooter";
import PublicNavbar from "../../../components/layout/PublicNavbar";

export const Route = createFileRoute("/(public)/_public")({
  component: PublicLayout,
});

function PublicLayout() {
  return (
    <>
      <header class="fixed inset-x-0 top-0 z-50 p-2 sm:p-3">
        <PublicNavbar />
      </header>

      <main class="min-h-screen">
        <Outlet />
      </main>

      <FeatureSection
        id="features"
        title="Digital Twin Integration"
        description="Simulate building environments with high-fidelity digital twins for accurate predictions."
        image="/building-dt.webp"
        imageAlt="A building represented as a high-fidelity digital twin"
      />

      <FeatureSection
        title="HVAC Optimization"
        description="Advanced algorithms optimize HVAC systems for both occupant comfort and energy efficiency."
        image="/hvac-dt.webp"
        imageAlt="Digital visualization of an HVAC system"
        reverse
        muted
      />

      <FeatureSection
        title="Performance Metrics"
        description="Comprehensive analytics for energy consumption, thermal comfort, and system efficiency."
        image="/performance-metrics.webp"
        imageAlt="Dashboard showing building performance metrics"
      />

      <FeatureSection
        title="Occupant Comfort"
        description="Fair distribution of thermal comfort across all building occupants."
        image="/occupant_comfort.webp"
        imageAlt="Visualization of occupant thermal comfort"
        reverse
        muted
      />

      <PublicFooter />
    </>
  );
}
