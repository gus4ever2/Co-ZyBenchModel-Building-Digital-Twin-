import { createSignal, type Component } from "solid-js";
import { Outlet, createFileRoute, redirect } from "@tanstack/solid-router";
import AuthenticatedNavbar from "../../../components/layout/AuthenticatedNavbar";
import { getAccessToken } from "../../../lib/api";
import InfoModal from "../../../components/layout/InfoModal.tsx";
import {InfoModalContext} from "../../../context/InfoModalContext";

export const Route = createFileRoute("/(app)/_authenticated")({
  beforeLoad: () => {
    if (!getAccessToken()) {
      throw redirect({ to: "/sign-in" });
    }
  },

  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const [expanded, setExpanded] = createSignal(true);
  const [mobileOpen, setMobileOpen] = createSignal(false);
  const [infoModalOpen, setInfoModalOpen] = createSignal(false);
  const [infoModalContent, setInfoModalContent] = createSignal<Component>();

  return (
      <>
          <InfoModalContext.Provider value={{setInfoModalOpen, setInfoModalContent}}>

            <InfoModal
              infoModal={infoModalOpen()}
              infoModalContent={infoModalContent()}
              onClose={() => setInfoModalOpen(false)}
            />

            <div class="fixed inset-0 overflow-hidden bg-[url(/graphite.webp)] bg-cover bg-center">
              <AuthenticatedNavbar
                expanded={expanded}
                setExpanded={setExpanded}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
              />

              <main
                class="h-full overflow-hidden px-5 py-20 transition-[padding] duration-300 sm:px-8 lg:py-8"
                classList={{
                  "lg:pl-[16.5rem]": expanded(),
                  "lg:pl-[6.5rem]": !expanded(),
                }}
              >
                <Outlet />
              </main>
            </div>

          </InfoModalContext.Provider>
      </>
  );
}
