import { createSignal, type Component } from "solid-js";
import { Outlet, createFileRoute } from "@tanstack/solid-router";
import GuestNavbar from "../../components/layout/GuestNavbar";
import InfoModal from "../../components/layout/InfoModal";
import { InfoModalContext } from "../../context/InfoModalContext";
import { GuestModeProvider } from "../../context/GuestModeContext";

export const Route = createFileRoute("/guest")({ component: GuestLayout });

function GuestLayout() {
  const [infoModalOpen, setInfoModalOpen] = createSignal(false);
  const [infoModalContent, setInfoModalContent] = createSignal<Component>();

  return (
    <GuestModeProvider>
      <InfoModalContext.Provider value={{ setInfoModalOpen, setInfoModalContent }}>
        <InfoModal
          infoModal={infoModalOpen()}
          infoModalContent={infoModalContent()}
          onClose={() => setInfoModalOpen(false)}
        />
        <div class="fixed inset-0 overflow-hidden bg-[url(/graphite.webp)] bg-cover bg-center">
          <GuestNavbar />
          <main class="h-full overflow-hidden px-5 py-20 transition-[padding] duration-300 sm:px-8 lg:py-8 lg:pl-[17rem]">
            <Outlet />
          </main>
        </div>
      </InfoModalContext.Provider>
    </GuestModeProvider>
  );
}
